from django.contrib import admin
from django.shortcuts import redirect
from django.utils.html import format_html

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    readonly_fields = ("logo_preview",)
    fields = ("logo", "logo_preview")

    @admin.display(description="Preview")
    def logo_preview(self, obj):
        if not obj.logo:
            return "No logo uploaded yet — the site falls back to a text wordmark."
        return format_html(
            '<img src="{}" style="max-height: 120px; max-width: 100%; '
            'background: #222; padding: 12px; border-radius: 8px;" />',
            obj.logo.url,
        )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj = SiteSettings.load()
        return redirect("admin:branding_sitesettings_change", obj.pk)
