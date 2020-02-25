from celery import shared_task
from os import remove, path
from yandex_music import Client

from django.core.files.storage import default_storage
from django.conf import settings
from .models import Track

@shared_task
def download(track_id, id_value):
    file = Track.objects.get(pk=track_id).file
    track = Client.from_token(settings.YANDEX_MUSIC_TOKEN).tracks(id_value)[0]
    max_bitrate = max([info.bitrate_in_kbps for info in track.get_download_info()])
    track.download('track.mp3', bitrate_in_kbps=max_bitrate)
    default_storage.save(path.join('tracks', file), open('track.mp3', 'rb'))
    remove('track.mp3')
    t = Track.objects.get(pk=track_id)
    t.url = default_storage.url(path.join('tracks', t.file))
    t.save()
    return

@shared_task
def purge(file):
    default_storage.delete(path.join('tracks', file))
    return
