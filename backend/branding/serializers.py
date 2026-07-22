from rest_framework import serializers

from .models import SiteSettings, Sponsor


class SponsorSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Sponsor
        fields = ("id", "name", "logo_url", "website_url")

    def get_logo_url(self, obj):
        request = self.context.get("request")
        url = obj.logo.url
        return request.build_absolute_uri(url) if request else url


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    sponsors = SponsorSerializer(many=True, read_only=True)

    class Meta:
        model = SiteSettings
        fields = ("logo_url", "sponsors")

    def get_logo_url(self, obj):
        if not obj.logo:
            return ""
        request = self.context.get("request")
        url = obj.logo.url
        return request.build_absolute_uri(url) if request else url
