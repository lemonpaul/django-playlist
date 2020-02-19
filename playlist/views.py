from os import remove, path
from datetime import timedelta, datetime
from hashlib import sha1

from django.core.files import File
from django.shortcuts import render
from django.conf import settings
from django.core.exceptions import PermissionDenied
from .models import Track

from yandex_music.client import Client

client = Client.fromCredentials(settings.YANDEX_MUSIC_USER, settings.YANDEX_MUSIC_PASSWORD)


def index(request):
    if not request.session.get('user_id', False):
        request.session['user_id'] = sha1(str.encode(str(datetime.now().timestamp()))).hexdigest()
    context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
    return render(request, 'playlist/index.html', context)


def add(request):
    if request.method == "POST":
        id_value = str(request.POST['id'])
        track = client.tracks(id_value)[0]
        title = track.title
        artists = list(map(lambda t: t.name, track.artists))
        duration = timedelta(milliseconds=track.duration_ms)
        new_track = Track.objects.create(title=title, artists=artists, duration=duration)
        new_track.save()
        track.download(path.join(settings.MEDIA_ROOT, 'tracks/track.mp3'), bitrate_in_kbps=320)
        new_track.file.save('track.mp3', File(open(path.join(settings.MEDIA_ROOT, 'tracks/track.mp3'), 'rb')))
        remove(path.join(settings.MEDIA_ROOT, 'tracks/track.mp3'))
        new_track.save()
        context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
        return render(request, 'playlist/_list.html', context)
    else:
        raise PermissionDenied


def search(request):
    if request.is_ajax():
        if request.GET.get('text', False):
            text = request.GET['text']
            tracks = client.search(text, type_='track').tracks
            if tracks:
                track_list = list(map(lambda t: {
                    'artists': list(map(lambda a: a.name, t.artists)),
                    'title': t.title,
                    'album': t.albums[0].title,
                    'id': str(t.id)+":"+str(t.albums[0].id),
                    'duration': "%d:%02d" % (int(t.duration_ms/60/1000),
                                             int(t.duration_ms/1000)-int(t.duration_ms/60/1000)*60)
                }, tracks.results))
                context = {'results': track_list}
            else:
                context = {'results': []}
            return render(request, 'playlist/_search.html', context)
        else:
            return render(request, 'playlist/_search.html')
    else:
        raise PermissionDenied


def clear(request):
    if request.is_ajax():
        return render(request, 'playlist/_search.html')
    else:
        raise PermissionDenied


def delete(request):
    if request.method == "POST":
        if request.is_ajax():
            track = Track.objects.get(id=request.POST['id'])
            track.delete()
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
    else:
        raise PermissionDenied


def update(request):
    if request.is_ajax():
        if request.method == 'GET':
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
        elif request.method == 'POST':
            track = Track.objects.get(id=request.POST['id'])
            track.add_at = datetime.now()
            track.rate = 0
            track.voices_down = []
            track.voices_up = []
            track.save()
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
    else:
        raise PermissionDenied


def vote(request):
    if request.is_ajax():
        if request.method == 'POST':
            track = Track.objects.get(id=request.POST['id'])
            if request.POST['vote'] == 'up':
                if request.session['user_id'] not in track.voices_up:
                    if request.session['user_id'] in track.voices_down:
                        track.rate = track.rate + 1
                        track.voices_down.remove(request.session['user_id'])
                    else:
                        track.rate = track.rate + 1
                        track.voices_up.append(request.session['user_id'])
            elif request.POST['vote'] == 'down':
                if request.session['user_id'] not in track.voices_down:
                    if request.session['user_id'] in track.voices_up:
                        track.rate = track.rate - 1
                        track.voices_up.remove(request.session['user_id'])
                    else:
                        track.rate = track.rate - 1
                        track.voices_down.append(request.session['user_id'])
            track.save()
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
        else:
            raise PermissionDenied
    else:
        raise PermissionDenied
