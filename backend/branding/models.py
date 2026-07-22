from django.db import models


class SiteSettings(models.Model):
    """Singleton — always use `SiteSettings.load()`, never query directly."""

    logo = models.ImageField(upload_to="branding/", blank=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Sponsor(models.Model):
    """
    Site-wide sponsor logos — shown on the home page and every event page.
    Capped at 4 in the admin inline; entirely optional (no rows = no section).
    """

    site_settings = models.ForeignKey(
        SiteSettings, on_delete=models.CASCADE, related_name="sponsors"
    )
    name = models.CharField(max_length=200, help_text="Used as the logo's alt text.")
    logo = models.ImageField(upload_to="branding/sponsors/")
    website_url = models.URLField(blank=True, help_text="Optional — makes the logo clickable.")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name
