from django_quill.drf.fields import QuillHtmlField
from rest_framework import serializers

from .models import Artist, EventLineup


class ArtistSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    bio = QuillHtmlField(read_only=True)

    class Meta:
        model = Artist
        fields = (
            "id",
            "name",
            "slug",
            "role",
            "bio",
            "photo_url",
            "instagram_handle",
        )

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            url = obj.photo.url
            return request.build_absolute_uri(url) if request else url
        return obj.photo_url


class LineupEntrySerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = EventLineup
        fields = ("artist", "role_override", "is_featured", "sort_order")
