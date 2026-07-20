from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from tickets.serializers import AttendeeSerializer
from users.permissions import IsHostOrAdministrator

from .models import Event
from .serializers import EventDetailSerializer, EventListSerializer, WaitlistSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            Event.objects.filter(status=Event.Status.PUBLISHED)
            .select_related("venue")
            .prefetch_related("ticket_types", "lineup_entries__artist", "photos")
        )
        when = self.request.query_params.get("when")
        now = timezone.now()
        if when == "past":
            return qs.filter(start_at__lt=now).order_by("-start_at")
        if when == "upcoming":
            return qs.filter(start_at__gte=now)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EventDetailSerializer
        return EventListSerializer

    @action(detail=True, methods=["post"], url_path="waitlist", permission_classes=[AllowAny])
    def join_waitlist(self, request, slug=None):
        event = self.get_object()
        serializer = WaitlistSerializer(data=request.data, context={"event": event})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "You're on the waitlist — we'll email you if a spot opens up."},
            status=201,
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="attendees",
        permission_classes=[IsHostOrAdministrator],
    )
    def attendees(self, request, slug=None):
        from django.db.models import Q

        from tickets.models import Ticket

        event = self.get_object()
        qs = (
            Ticket.objects.filter(ticket_type__event=event)
            .select_related("ticket_type", "order")
            .order_by("attendee_name")
        )
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(attendee_name__icontains=search)
                | Q(attendee_email__icontains=search)
                | Q(order__email__icontains=search)
            )
        return Response(AttendeeSerializer(qs, many=True, context={"request": request}).data)
