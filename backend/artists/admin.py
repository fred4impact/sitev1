from django.contrib import admin
from django.utils.html import format_html

from .models import Artist


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "is_house_band", "created_at")
    list_filter = ("is_house_band",)
    search_fields = ("name", "role", "bio")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("photo_preview",)
    fields = (
        "name",
        "slug",
        "role",
        "bio",
        "photo",
        "photo_preview",
        "photo_url",
        "instagram_handle",
        "is_house_band",
    )

    @admin.display(description="Preview")
    def photo_preview(self, obj):
        url = obj.photo.url if obj.photo else obj.photo_url
        if not url:
            return "No photo set yet."
        return format_html(
            '<img src="{}" style="max-height: 200px; max-width: 200px; '
            'border-radius: 8px; object-fit: cover;" />',
            url,
        )
