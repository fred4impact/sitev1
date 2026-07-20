from django.contrib import admin
from django.utils.html import format_html

from artists.models import EventLineup

from .models import Event, EventPhoto, TicketType, Waitlist


class TicketTypeInline(admin.TabularInline):
    model = TicketType
    extra = 0


class EventLineupInline(admin.TabularInline):
    model = EventLineup
    extra = 0
    autocomplete_fields = ("artist",)


class EventPhotoInline(admin.TabularInline):
    model = EventPhoto
    extra = 3
    readonly_fields = ("photo_preview",)
    fields = ("image", "photo_preview", "caption", "sort_order")

    @admin.display(description="Preview")
    def photo_preview(self, obj):
        if not obj.pk or not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; border-radius: 4px;" />',
            obj.image.url,
        )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "venue",
        "start_at",
        "status",
        "min_price",
        "tickets_sold",
        "is_sold_out",
    )
    list_filter = ("status", "venue")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "start_at"
    readonly_fields = ("cover_image_preview",)
    fields = (
        "title",
        "slug",
        "venue",
        "description",
        "start_at",
        "end_at",
        "currency",
        "status",
        "cover_image",
        "cover_image_preview",
        "cover_image_url",
        "video_url",
    )
    inlines = [TicketTypeInline, EventLineupInline, EventPhotoInline]

    @admin.display(description="Preview")
    def cover_image_preview(self, obj):
        url = obj.cover_image.url if obj.cover_image else obj.cover_image_url
        if not url:
            return "No banner set yet."
        return format_html(
            '<img src="{}" style="max-height: 240px; max-width: 100%; '
            'border-radius: 8px; object-fit: cover;" />',
            url,
        )


@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "event", "notified", "created_at")
    list_filter = ("notified", "event")
    search_fields = ("name", "email")
