from django.db import models
from django.contrib.postgres.fields import ArrayField


class Track(models.Model):
    title = models.CharField(max_length=256)
    artists = ArrayField(models.CharField(max_length=256))
    duration = models.DurationField()
    file = models.CharField(max_length=256)
    url = models.CharField(max_length=512, null=True)
    add_at = models.DateTimeField(auto_now_add=True)
    rate = models.IntegerField(default=0)
    voices_up = ArrayField(models.CharField(max_length=256), default=list)
    voices_down = ArrayField(models.CharField(max_length=256), default=list)

    def duration_string(self):
        secs = self.duration.seconds
        mins = int(secs/60)
        secs -= mins*60
        return "%d:%02d" % (mins, secs)
