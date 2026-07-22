import json

import ckeditor.fields
from django.db import migrations


def quill_json_to_html(value):
    if not value:
        return ""
    try:
        return json.loads(value).get("html", "")
    except (json.JSONDecodeError, TypeError, AttributeError):
        # Already plain text/HTML (shouldn't happen post-Quill, but don't
        # lose data if it does).
        return value


def convert_forward(apps, schema_editor):
    # Use values_list()/update() rather than instance attribute access: the
    # historical model here still reflects QuillField (set by the previous
    # migration), whose descriptor would wrap description into a FieldQuill
    # object on read and re-serialize it back to Quill JSON on save. Reading
    # and writing at the queryset level bypasses that descriptor entirely.
    Event = apps.get_model("events", "Event")
    for pk, raw in Event.objects.exclude(description="").values_list("id", "description"):
        Event.objects.filter(pk=pk).update(description=quill_json_to_html(raw))


def convert_backward(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0004_event_description_to_quill"),
    ]

    operations = [
        migrations.RunPython(convert_forward, convert_backward),
        migrations.AlterField(
            model_name="event",
            name="description",
            field=ckeditor.fields.RichTextField(blank=True),
        ),
    ]
