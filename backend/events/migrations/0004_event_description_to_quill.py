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
    Event = apps.get_model("events", "Event")
    for event in Event.objects.exclude(description=""):
        event.description = to_quill_json(event.description)
        event.save(update_fields=["description"])


def convert_descriptions_backward(apps, schema_editor):
    # Not reversible in a meaningful way (would need to strip HTML back to
    # plain text); leave the Quill JSON in place rather than guess.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0003_event_video_url_eventphoto"),
    ]

    operations = [
        migrations.RunPython(convert_descriptions_forward, convert_descriptions_backward),
        migrations.AlterField(
            model_name="event",
            name="description",
            field=django_quill.fields.QuillField(blank=True),
        ),
    ]
