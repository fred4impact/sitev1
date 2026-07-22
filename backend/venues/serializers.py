from django_quill.drf.fields import QuillHtmlField
from rest_framework import serializers

from .models import Venue


class VenueSerializer(serializers.ModelSerializer):
    description = QuillHtmlField(read_only=True)

    class Meta:
        model = Venue
        fields = (
            "id",
            "name",
            "slug",
            "address",
            "city",
            "capacity",
            "description",
            "image_url",
        )
