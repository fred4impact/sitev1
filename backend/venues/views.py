from rest_framework import viewsets

from .models import Venue
from .serializers import VenueSerializer


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    lookup_field = "slug"
