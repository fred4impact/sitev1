from django.db import models
from django.utils.text import slugify


class Artist(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    role = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="artists/photos/", blank=True)
    photo_url = models.URLField(
        blank=True, help_text="Only used if no photo is uploaded above."
    )
    instagram_handle = models.CharField(max_length=100, blank=True)
    is_house_band = models.BooleanField(
        default=False,
        help_text="Constant house band member — shown on the About page. "
        "Leave unchecked for one-off guest artists added to a specific event's lineup.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class EventLineup(models.Model):
    event = models.ForeignKey(
        "events.Event", on_delete=models.CASCADE, related_name="lineup_entries"
    )
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="lineup_entries")
    role_override = models.CharField(max_length=120, blank=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        unique_together = ("event", "artist")

    def __str__(self):
        return f"{self.artist.name} — {self.event.title}"
