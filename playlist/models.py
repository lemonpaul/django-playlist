import os

from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.dispatch import receiver


class Track(models.Model):
    title = models.CharField(max_length=256)
    artists = ArrayField(models.CharField(max_length=256))
    duration = models.DurationField()
    file = models.FileField(upload_to='tracks/', null=True, blank=True)
    add_at = models.DateTimeField(auto_now_add=True)

    def duration_string(self):
        secs = self.duration.seconds
        mins = int(secs/60)
        secs -= mins*60
        return "%d:%02d" % (mins, secs)


@receiver(models.signals.post_delete, sender=Track)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

