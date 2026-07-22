from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django_quill.fields import QuillField

from venues.models import Venue


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name="events")
    description = QuillField(blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(null=True, blank=True)
    currency = models.CharField(max_length=3, default="GBP")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    cover_image = models.ImageField(upload_to="events/covers/", blank=True)
    cover_image_url = models.URLField(
        blank=True, help_text="Only used if no cover image is uploaded above."
    )
    video_url = models.URLField(
        blank=True, help_text="YouTube link, e.g. for a past session's recap video."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def tickets_sold(self):
        from tickets.models import Ticket

        return Ticket.objects.filter(
            ticket_type__event=self, status__in=[Ticket.Status.VALID, Ticket.Status.USED]
        ).count()

    @property
    def min_price(self):
        prices = [
            t.price for t in self.ticket_types.all() if not t.is_guest_list
        ]
        return min(prices) if prices else None

    @property
    def is_sold_out(self):
        types = list(self.ticket_types.all())
        return bool(types) and all(t.is_sold_out for t in types)

    @property
    def is_past(self):
        return self.start_at < timezone.now()


class EventPhoto(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="events/gallery/")
    caption = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"Photo — {self.event.title}"


class TicketType(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="ticket_types")
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="GBP")
    capacity = models.PositiveIntegerField(default=0)
    sales_start = models.DateTimeField(null=True, blank=True)
    sales_end = models.DateTimeField(null=True, blank=True)
    is_guest_list = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.name} — {self.event.title}"

    @property
    def is_free(self):
        return self.price == 0

    @property
    def tickets_sold(self):
        return self.tickets.filter(status__in=["valid", "used"]).count()

    @property
    def spots_remaining(self):
        if not self.capacity:
            return None
        return max(self.capacity - self.tickets_sold, 0)

    @property
    def is_sold_out(self):
        return bool(self.capacity) and self.tickets_sold >= self.capacity

    @property
    def is_on_sale(self):
        now = timezone.now()
        if self.sales_start and now < self.sales_start:
            return False
        if self.sales_end and now > self.sales_end:
            return False
        return True


class Waitlist(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="waitlist_entries")
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        unique_together = ("event", "email")

    def __str__(self):
        return f"{self.name} — {self.event.title}"
