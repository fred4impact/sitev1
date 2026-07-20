from rest_framework import viewsets

from .models import Artist
from .serializers import ArtistSerializer


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ArtistSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = Artist.objects.all()
        house_band = self.request.query_params.get("house_band")
        if house_band is not None:
            qs = qs.filter(is_house_band=house_band.lower() in ("1", "true", "yes"))
        return qs
