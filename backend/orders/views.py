import stripe
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderSerializer
from .services import CapacityExceeded, finalize_paid_order


class CreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.validated_data["event"]
        email = serializer.validated_data["email"]
        resolved_items = serializer.validated_data["resolved_items"]

        for ticket_type, quantity in resolved_items:
            if ticket_type.capacity and ticket_type.spots_remaining < quantity:
                return Response(
                    {
                        "detail": f"Only {ticket_type.spots_remaining} spot(s) remaining for {ticket_type.name}.",
                        "waitlist": True,
                    },
                    status=status.HTTP_409_CONFLICT,
                )

        total_amount = sum(tt.price * qty for tt, qty in resolved_items)

        order = Order.objects.create(
            event=event,
            email=email,
            total_amount=total_amount,
            currency=event.currency,
            user=request.user if request.user.is_authenticated else None,
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    ticket_type=ticket_type,
                    quantity=quantity,
                    unit_price=ticket_type.price,
                    subtotal=ticket_type.price * quantity,
                )
                for ticket_type, quantity in resolved_items
            ]
        )

        if total_amount == 0 or not settings.STRIPE_SECRET_KEY:
            # Skip Stripe entirely for $0 orders (guest list / comp tickets —
            # Stripe rejects zero-amount PaymentIntents) and for the dev
            # fallback when no Stripe keys are configured yet. Switches to
            # real payments automatically once STRIPE_SECRET_KEY is set.
            try:
                finalize_paid_order(order)
            except CapacityExceeded as exc:
                return Response({"detail": str(exc), "waitlist": True}, status=409)
            order.refresh_from_db()
            return Response(
                {
                    "order": OrderSerializer(order, context={"request": request}).data,
                    "client_secret": None,
                    "stripe_configured": False,
                },
                status=status.HTTP_201_CREATED,
            )

        stripe.api_key = settings.STRIPE_SECRET_KEY
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),
            currency=event.currency.lower(),
            receipt_email=email,
            metadata={"order_id": order.pk, "order_public_id": str(order.public_id)},
        )
        order.stripe_payment_intent_id = intent.id
        order.save(update_fields=["stripe_payment_intent_id"])

        return Response(
            {
                "order": OrderSerializer(order, context={"request": request}).data,
                "client_secret": intent.client_secret,
                "stripe_configured": True,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"


class ConfirmOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)

        if order.status == Order.Status.PAID:
            return Response(OrderSerializer(order, context={"request": request}).data)

        if not order.stripe_payment_intent_id:
            return Response({"detail": "No payment associated with this order."}, status=400)

        stripe.api_key = settings.STRIPE_SECRET_KEY
        intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)
        if intent.status != "succeeded":
            return Response(
                {"detail": f"Payment not completed (status: {intent.status})."},
                status=400,
            )

        try:
            finalize_paid_order(order)
        except CapacityExceeded as exc:
            return Response({"detail": str(exc)}, status=409)

        order.refresh_from_db()
        return Response(OrderSerializer(order, context={"request": request}).data)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return JsonResponse({"error": "invalid payload or signature"}, status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        try:
            order = Order.objects.get(stripe_payment_intent_id=intent["id"])
            finalize_paid_order(order)
        except (Order.DoesNotExist, CapacityExceeded):
            pass

    return JsonResponse({"status": "ok"})
