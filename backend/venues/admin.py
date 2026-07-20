from django.contrib import admin

from .models import Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "capacity", "created_at")
    list_filter = ("city",)
    search_fields = ("name", "city", "address")
    prepopulated_fields = {"slug": ("name",)}
