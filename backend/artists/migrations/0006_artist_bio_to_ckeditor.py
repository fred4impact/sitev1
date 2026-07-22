import json

import ckeditor.fields
from django.db import migrations


def quill_json_to_html(value):
    if not value:
        return ""
    try:
        return json.loads(value).get("html", "")
    except (json.JSONDecodeError, TypeError, AttributeError):
        return value


def convert_forward(apps, schema_editor):
    # Use values_list()/update() rather than instance attribute access: the
    # historical model here still reflects QuillField (set by the previous
    # migration), whose descriptor would wrap bio into a FieldQuill object
    # on read and re-serialize it back to Quill JSON on save. Reading and
    # writing at the queryset level bypasses that descriptor entirely.
    Artist = apps.get_model("artists", "Artist")
    for pk, raw in Artist.objects.exclude(bio="").values_list("id", "bio"):
        Artist.objects.filter(pk=pk).update(bio=quill_json_to_html(raw))


def convert_backward(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("artists", "0005_artist_bio_to_quill"),
    ]

    operations = [
        migrations.RunPython(convert_forward, convert_backward),
        migrations.AlterField(
            model_name="artist",
            name="bio",
            field=ckeditor.fields.RichTextField(blank=True),
        ),
    ]
