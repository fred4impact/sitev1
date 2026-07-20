import io

import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.permissions import IsHostOrAdministrator

from .models import Ticket
from .serializers import TicketSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def ticket_qr(request, qr_token):
    ticket = get_object_or_404(Ticket, qr_token=qr_token)
    img = qrcode.make(str(ticket.qr_token))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


@api_view(["POST"])
@permission_classes([IsHostOrAdministrator])
def ticket_check_in(request, qr_token):
    ticket = get_object_or_404(Ticket, qr_token=qr_token)

    if ticket.status == Ticket.Status.CANCELLED:
        return Response({"detail": "This ticket has been cancelled."}, status=400)

    if ticket.status == Ticket.Status.USED:
        return Response(
            {
                "detail": f"Already checked in at {ticket.checked_in_at:%H:%M} on "
                f"{ticket.checked_in_at:%d %b %Y}.",
                "ticket": TicketSerializer(ticket, context={"request": request}).data,
            },
            status=409,
        )

    ticket.status = Ticket.Status.USED
    ticket.checked_in_at = timezone.now()
    ticket.save(update_fields=["status", "checked_in_at"])

    return Response(
        {
            "detail": f"Checked in for {ticket.event.title}.",
            "ticket": TicketSerializer(ticket, context={"request": request}).data,
        }
    )
