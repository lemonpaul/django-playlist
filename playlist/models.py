from django.db import models
from django.contrib.postgres.fields import ArrayField


class Track(models.Model):
    title = models.CharField(max_length=256)
    artists = ArrayField(models.CharField(max_length=256))
    duration = models.DurationField()
    identifier = models.CharField(max_length=256)
    url = models.CharField(max_length=512)
    add_at = models.DateTimeField(auto_now_add=True)
    rate = models.IntegerField(default=0)
    voices_up = ArrayField(models.CharField(max_length=256), default=list)
    voices_down = ArrayField(models.CharField(max_length=256), default=list)

    def duration_string(self):
        secs = self.duration.seconds
        mins = int(secs/60)
        secs -= mins*60
        return "%d:%02d" % (mins, secs)

    def __str__(self):
        return "%d. %s - %s" % (self.id, ', '.join(self.artists), self.title)
