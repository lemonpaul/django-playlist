from os import remove, path
from datetime import timedelta
from django.utils import timezone
from hashlib import sha1
from yandex_music.client import Client
from math import ceil

from django.core.files.storage import default_storage
from django.core.files import File
from django.shortcuts import render
from django.conf import settings
from django.core.exceptions import PermissionDenied
from .models import Track


client = Client.from_token(settings.YANDEX_MUSIC_TOKEN)


def index(request):
    if not request.session.get('user_id', False):
        request.session['user_id'] = sha1(str.encode(str(timezone.now().timestamp()))).hexdigest()
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
        filename = sha1(str.encode(str(timezone.now().timestamp()))).hexdigest()+'.mp3'
        max_bitrate = max([info.bitrate_in_kbps for info in track.get_download_info()])
        track.download(path.join(settings.MEDIA_ROOT, 'track.mp3'), bitrate_in_kbps=max_bitrate)
        new_track.file.save(filename, File(open(path.join(settings.MEDIA_ROOT, 'track.mp3'), 'rb')))
        remove(path.join(settings.MEDIA_ROOT, 'track.mp3'))
        new_track.save()
        context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
        return render(request, 'playlist/_list.html', context)
    raise PermissionDenied


def search(request):
    if request.is_ajax():
        if request.GET.get('text', False):
            text = request.GET['text']
            page_num = request.GET.get('page', 0)
            tracks = client.search(text, type_='track', page=page_num).tracks
            if tracks:
                page_count = ceil(tracks.total / tracks.per_page)
                track_list = list(map(lambda t: {
                    'artists': list(map(lambda a: a.name, t.artists)),
                    'title': t.title,
                    'album': t.albums[0].title,
                    'id': str(t.id)+":"+str(t.albums[0].id),
                    'duration': "%d:%02d" % (int(t.duration_ms/60/1000),
                                             int(t.duration_ms/1000)-int(t.duration_ms/60/1000)*60)
                }, tracks.results))
                context = {'results': track_list, 'page': page_num, 'total': page_count}
            else:
                page_count = 0
                context = {'results': [], 'page': page_num, 'total': page_count}
            return render(request, 'playlist/_search.html', context)
        else:
            return render(request, 'playlist/_search.html')
    raise PermissionDenied


def clear(request):
    if request.is_ajax():
        return render(request, 'playlist/_search.html')
    raise PermissionDenied


def delete(request):
    if request.method == "POST":
        if request.is_ajax():
            track = Track.objects.get(id=request.POST['id'])
            default_storage.delete(track.file.name)
            track.delete()
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
    raise PermissionDenied


def update(request):
    if request.is_ajax():
        if request.method == 'GET':
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
        elif request.method == 'POST':
            track = Track.objects.get(id=request.POST['id'])
            track.add_at = timezone.now()
            track.rate = 0
            track.voices_down = []
            track.voices_up = []
            track.save()
            context = {'track_list': Track.objects.all().order_by(*['-rate', 'add_at'])}
            return render(request, 'playlist/_list.html', context)
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
    raise PermissionDenied


def autocomplete(request):
    if request.is_ajax():
        if request.method == 'GET':
            if request.GET.get('query', False):
                query = request.GET['query']
                try:
                    suggestions = client.search_suggest(query).suggestions
                except TypeError:
                    suggestions = []
                context = {'suggestions': suggestions}
                return render(request, 'playlist/_suggestion.html', context)
            else:
                return render(request, 'playlist/_suggestion.html')
    raise PermissionDenied
