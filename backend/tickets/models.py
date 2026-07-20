import uuid

from django.db import models

from events.models import TicketType
from orders.models import Order


class Ticket(models.Model):
    class Status(models.TextChoices):
        VALID = "valid", "Valid"
        USED = "used", "Used"
        CANCELLED = "cancelled", "Cancelled"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tickets")
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT, related_name="tickets")
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    attendee_name = models.CharField(max_length=200, blank=True)
    attendee_email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Ticket {self.qr_token} — {self.ticket_type.event.title}"

    @property
    def event(self):
        return self.ticket_type.event
