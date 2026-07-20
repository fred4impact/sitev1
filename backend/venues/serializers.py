from rest_framework import serializers

from .models import Venue


class VenueSerializer(serializers.ModelSerializer):
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
