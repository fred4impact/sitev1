import json

import django_quill.fields
from django.db import migrations


def to_quill_json(plain_text):
    if not plain_text:
        return ""
    normalized = plain_text.replace("\r\n", "\n").replace("\r", "\n")
    html = "<p>%s</p>" % normalized.replace("&", "&amp;").replace("<", "&lt;").replace(
        ">", "&gt;"
    ).replace("\n", "<br>")
    delta = {"ops": [{"insert": normalized + "\n"}]}
    return json.dumps({"delta": delta, "html": html})


def convert_descriptions_forward(apps, schema_editor):
    Venue = apps.get_model("venues", "Venue")
    for venue in Venue.objects.exclude(description=""):
        venue.description = to_quill_json(venue.description)
        venue.save(update_fields=["description"])


def convert_descriptions_backward(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("venues", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(convert_descriptions_forward, convert_descriptions_backward),
        migrations.AlterField(
            model_name="venue",
            name="description",
            field=django_quill.fields.QuillField(blank=True),
        ),
    ]
