# django-playlist

Simple django application that allow to use common dynamical playlist.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

This project use postgresql database and yandex music api library. You need to install them.

```
pip3 install psycopg2 yandex-music
```

### Installing

Change YANDEX_MUSIC_USER and YANDEX_MUSIC_PASSWORD in settings.py

```
YANDEX_MUSIC_USER = 'user@yandex.ru'
YANDEX_MUSIC_PASSWORD = 'password'
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
