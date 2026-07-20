from django.contrib import admin

from tickets.models import Ticket

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class TicketInline(admin.TabularInline):
    model = Ticket
    extra = 0
    readonly_fields = ("qr_token", "created_at")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "email", "total_amount", "status", "created_at")
    list_filter = ("status", "event")
    search_fields = ("email", "stripe_payment_intent_id")
    inlines = [OrderItemInline, TicketInline]
