from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("qr_token", "ticket_type", "order", "status", "checked_in_at")
    list_filter = ("status", "ticket_type__event")
    search_fields = ("qr_token", "attendee_email", "attendee_name")
    readonly_fields = ("qr_token",)
