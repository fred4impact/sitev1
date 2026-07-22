from pathlib import Path

from django.core.files import File
from django.db import migrations

SEED_LOGO = Path(__file__).resolve().parent.parent / "seed_assets" / "jazz-logo.png"


def seed_logo(apps, schema_editor):
    SiteSettings = apps.get_model("branding", "SiteSettings")
    settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)
    if settings_obj.logo:
        return  # a real logo's already been uploaded — don't clobber it
    with open(SEED_LOGO, "rb") as f:
        settings_obj.logo.save("jazz-logo.png", File(f), save=True)


def unseed_logo(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("branding", "0002_sponsor"),
    ]

    operations = [
        migrations.RunPython(seed_logo, unseed_logo),
    ]
