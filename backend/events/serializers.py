from django_quill.drf.fields import QuillHtmlField
from rest_framework import serializers

from artists.serializers import LineupEntrySerializer
from venues.serializers import VenueSerializer

from .models import Event, EventPhoto, TicketType, Waitlist


class TicketTypeSerializer(serializers.ModelSerializer):
    is_free = serializers.BooleanField(read_only=True)
    is_sold_out = serializers.BooleanField(read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    spots_remaining = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = TicketType
        fields = (
            "id",
            "name",
            "description",
            "price",
            "currency",
            "capacity",
            "is_guest_list",
            "is_free",
            "sales_start",
            "sales_end",
            "is_on_sale",
            "spots_remaining",
            "is_sold_out",
            "sort_order",
        )


class EventPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EventPhoto
        fields = ("id", "image_url", "caption", "sort_order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class EventListSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    min_price = serializers.DecimalField(
        max_digits=8, decimal_places=2, read_only=True, allow_null=True
    )
    is_sold_out = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "slug",
            "venue",
            "start_at",
            "end_at",
            "min_price",
            "currency",
            "cover_image_url",
            "is_sold_out",
            "is_past",
        )

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get("request")
            url = obj.cover_image.url
            return request.build_absolute_uri(url) if request else url
        return obj.cover_image_url


class EventDetailSerializer(EventListSerializer):
    description = QuillHtmlField(read_only=True)
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    lineup = LineupEntrySerializer(source="lineup_entries", many=True, read_only=True)
    photos = EventPhotoSerializer(many=True, read_only=True)
    tickets_sold = serializers.IntegerField(read_only=True)

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + (
            "description",
            "ticket_types",
            "lineup",
            "photos",
            "video_url",
            "tickets_sold",
        )


class WaitlistSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def create(self, validated_data):
        event = self.context["event"]
        entry, _ = Waitlist.objects.update_or_create(
            event=event,
            email=validated_data["email"],
            defaults={
                "name": validated_data["name"],
                "phone": validated_data.get("phone", ""),
            },
        )
        return entry
