# django-playlist

Simple django application that allow to use common dynamical playlist.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

This project use Django, postgresql database and yandex music api library. You need to install them.

```
pip3 install Django psycopg2 yandex-music
```

### Installing

Generate YANDEX_MUSIC_TOKEN using python and yandex music api

```
from yandex_music import Client
Client().generate_token_by_username_and_password('username@yandex.ru', password')
```

Change YANDEX_MUSIC_TOKEN in settings.py with generated one

```
YANDEX_MUSIC_TOKEN = 'auth_token'
```

Generate DROPBOX_OAUTH2_TOKEN and change it in settings.py

```
DROPBOX_OAUTH2_TOKEN = 'dropbox_auth_token'
```

Run migrations.

```
python3 manage.py migrate
```

Run server.

```
python3 manage.py runserver 0.0.0.0:8000
```

## Built With

* [Django](https://www.djangoproject.com/) - The web framework used
* [yandex-music-api](https://github.com/MarshalX/yandex-music-api/) - Used to get audio tracks

## License

This project is licensed under the GNU General Public License - see the [LICENSE](LICENSE) file for details
