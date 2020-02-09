# Generated by Django 3.0.3 on 2020-02-09 18:42

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=256)),
                ('artists', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=256), size=None)),
                ('file', models.FileField(blank=True, null=True, upload_to='tracks/')),
                ('add_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
