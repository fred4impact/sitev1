from rest_framework import serializers

from events.models import Event, TicketType
from events.serializers import EventListSerializer
from tickets.serializers import TicketSerializer

from .models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    ticket_type = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=10)


class OrderCreateSerializer(serializers.Serializer):
    event = serializers.SlugField()
    email = serializers.EmailField()
    items = OrderItemInputSerializer(many=True)

    def validate_event(self, value):
        try:
            event = Event.objects.get(slug=value, status=Event.Status.PUBLISHED)
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found.")
        return event

    def validate(self, data):
        event = data["event"]
        items = data["items"]
        if not items:
            raise serializers.ValidationError("At least one ticket type is required.")

        seen_ids = set()
        ticket_types = []
        for item in items:
            ticket_type_id = item["ticket_type"]
            if ticket_type_id in seen_ids:
                raise serializers.ValidationError("Duplicate ticket type in order.")
            seen_ids.add(ticket_type_id)
            try:
                ticket_type = event.ticket_types.get(pk=ticket_type_id)
            except TicketType.DoesNotExist:
                raise serializers.ValidationError("Ticket type not found for this event.")
            if not ticket_type.is_on_sale:
                raise serializers.ValidationError(f"{ticket_type.name} is not currently on sale.")
            ticket_types.append((ticket_type, item["quantity"]))

        has_guest_list = any(tt.is_guest_list for tt, _ in ticket_types)
        if has_guest_list and len(ticket_types) > 1:
            raise serializers.ValidationError(
                "Guest list entries can't be combined with other ticket types."
            )

        data["resolved_items"] = ticket_types
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("ticket_type", "ticket_type_name", "quantity", "unit_price", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    event = EventListSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "public_id",
            "event",
            "email",
            "items",
            "total_amount",
            "currency",
            "status",
            "tickets",
            "created_at",
        )
