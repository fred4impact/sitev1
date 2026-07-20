from django.db import transaction

from events.models import TicketType
from tickets.models import Ticket

from .emails import send_order_confirmation
from .models import Order


class CapacityExceeded(Exception):
    pass


def finalize_paid_order(order: Order) -> Order:
    """Mark an order paid and generate its tickets, guarding against overselling.

    Locks each ticket type row referenced by the order so concurrent
    finalizations for the same tier can't both pass the capacity check and
    oversell it.
    """
    with transaction.atomic():
        if order.status == Order.Status.PAID:
            return order  # already finalized — webhook and confirm can both fire

        item_ticket_type_ids = list(order.items.values_list("ticket_type_id", flat=True))
        locked_types = {
            tt.pk: tt
            for tt in TicketType.objects.select_for_update()
            .filter(pk__in=item_ticket_type_ids)
            .order_by("pk")
        }

        for item in order.items.select_related("ticket_type"):
            ticket_type = locked_types[item.ticket_type_id]
            if ticket_type.capacity and ticket_type.spots_remaining < item.quantity:
                order.status = Order.Status.CANCELLED
                order.save(update_fields=["status", "updated_at"])
                raise CapacityExceeded(
                    f"Only {ticket_type.spots_remaining} spot(s) left for {ticket_type.name}."
                )

        order.status = Order.Status.PAID
        order.save(update_fields=["status", "updated_at"])

        tickets = []
        for item in order.items.select_related("ticket_type"):
            tickets.extend(
                Ticket(order=order, ticket_type=item.ticket_type, attendee_email=order.email)
                for _ in range(item.quantity)
            )
        Ticket.objects.bulk_create(tickets)

    # Outside the transaction: don't hold the ticket type row locks on external I/O.
    send_order_confirmation(order)

    return order
