import os

from django.core.files import File
from django.shortcuts import render
from django.conf import settings
from .models import Track

from yandex_music.client import Client

client = Client.fromCredentials(settings.YANDEX_MUSIC_USER, settings.YANDEX_MUSIC_PASSWORD)


def index(request):
    context = {'track_list': Track.objects.all().order_by('add_at')}
    return render(request, 'playlist/index.html', context)


def add(request):
    if request.method == "POST":
        id_value = str(request.POST['id'])
        track = client.tracks(id_value)[0]
        title = track.title
        artists = list(map(lambda t: t.name, track.artists))
        new_track = Track.objects.create(title=title, artists=artists)
        new_track.save()
        track.download(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media/tracks/track.mp3'))
        new_track.file.save('track.mp3', File(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                              'media/tracks/track.mp3'), 'rb')))
        os.remove(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media/tracks/track.mp3'))
        new_track.save()
        context = {'track_list': Track.objects.all().order_by('add_at')}
        return render(request, 'playlist/_list.html', context)
    return render(request, 'playlist/_list.html')


def search(request):
    if request.GET.get('text', False):
        print('Here')
        text = request.GET['text']
        tracks = client.search(text, type_='track').tracks
        if tracks:
            track_list = list(map(lambda t: {
                'artists': list(map(lambda a: a.name, t.artists)),
                'title': t.title,
                'album': t.albums[0].title,
                'id': str(t.id)+":"+str(t.albums[0].id)
            }, tracks.results))
            context = {'results': track_list}
        else:
            context = {'results': []}
        return render(request, 'playlist/_search.html', context)
    return render(request, 'playlist/_search.html')


def clear(request):
    return render(request, 'playlist/_search.html')


def delete(request):
    if request.method == "POST":
        if request.is_ajax():
            track = Track.objects.get(id=request.POST['id'])
            track.delete()
            context = {'track_list': Track.objects.all().order_by('add_at')}
            return render(request, 'playlist/_list.html', context)
    return render(request, 'playlist/_list.html')


def update(request):
    if request.method == 'GET':
        if request.is_ajax():
            context = {'track_list': Track.objects.all().order_by('add_at')}
            return render(request, 'playlist/_list.html', context)
    return render(request, 'playlist/_list.html')

