from rest_framework import serializers

from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    qr_url = serializers.SerializerMethodField()
    event_title = serializers.CharField(source="ticket_type.event.title", read_only=True)
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "qr_token",
            "event_title",
            "ticket_type_name",
            "attendee_name",
            "attendee_email",
            "status",
            "checked_in_at",
            "qr_url",
        )

    def get_qr_url(self, obj):
        request = self.context.get("request")
        path = f"/api/tickets/{obj.qr_token}/qr/"
        return request.build_absolute_uri(path) if request else path


class AttendeeSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    order_email = serializers.EmailField(source="order.email", read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "qr_token",
            "attendee_name",
            "attendee_email",
            "order_email",
            "ticket_type_name",
            "status",
            "checked_in_at",
        )
