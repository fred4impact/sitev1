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


def convert_bios_forward(apps, schema_editor):
    Artist = apps.get_model("artists", "Artist")
    for artist in Artist.objects.exclude(bio=""):
        artist.bio = to_quill_json(artist.bio)
        artist.save(update_fields=["bio"])


def convert_bios_backward(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("artists", "0004_alter_artist_is_house_band"),
    ]

    operations = [
        migrations.RunPython(convert_bios_forward, convert_bios_backward),
        migrations.AlterField(
            model_name="artist",
            name="bio",
            field=django_quill.fields.QuillField(blank=True),
        ),
    ]
