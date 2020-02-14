var currentTrack = 0;

var current_url = function() { return $('#track'+currentTrack).find('a#track_url').attr('href'); };

var current_title = function() { return $('#track'+currentTrack).find('div#track_artist').text() +
                                        " - " + $('#track'+currentTrack).find('div#track_title').text(); };

var current_index = function(index) { $('div#track_index').get(currentTrack-1).innerText = index; };

var total = function() { return $('#_list').find('div#track_title').length; };

var dynamic_buttons = function() { return $('img.play').length !== 0 || $('img.pause').length !== 0; };

var list = function(data) { $('#_list').html(data); };

var tracks = function() { return Array.from($('#_list').find('a#track_url')).map(a => a.href); };

var elements = {
    audio: $('#audio'),
    title: $('#title'),
    next: $('img.next'),
    play: $('img.play'),
    pause: $('img.pause'),
    prev: $('img.prev')
};

elements.pause.parent().hide();

if (total() !== 0)
{
    currentTrack = 1;
    elements.audio.attr('src', current_url);
    elements.title.text(current_title);
};

$(function() {
    elements.pause.click(function (e) {
        e.preventDefault();
        elements.audio.get(0).pause();
        elements.play.parent().show();
        elements.pause.parent().hide();
    });
    elements.play.click(function (e) {
        e.preventDefault();
        if (currentTrack !== 0) {
            elements.audio.get(0).play();
            elements.pause.parent().show();
            elements.play.parent().hide();
        }
    });
    elements.next.click(function (e) {
        e.preventDefault();
        paused = elements.audio.get(0).paused;
        if (currentTrack !== 0)
        {
            current_index(currentTrack);
            if (currentTrack == total())
            {
                currentTrack = 1;
            } else {
                currentTrack++;
            }
            current_index('*');
            elements.audio.attr('src', current_url);
            elements.title.text(current_title);
            if (!paused) elements.audio.get(0).play();
        }
    });
    elements.prev.click(function (e) {
        e.preventDefault();
        paused = elements.audio.get(0).paused;
        if (currentTrack !== 0)
        {
            current_index(currentTrack);
            if (currentTrack == 1)
            {
                currentTrack = total();
            } else {
                currentTrack--;
            }
            current_index('*');
            elements.audio.attr('src', current_url);
            elements.title.text(current_title);
            if (!paused) elements.audio.get(0).play();
        }
    });
    elements.audio.on('ended', function (e) {
        current_index(currentTrack);
        if (currentTrack == total())
        {
            currentTrack = 1;
        } else {
            currentTrack++;
        }
        current_index('*');
        elements.audio.attr('src', current_url);
        elements.title.text(current_title);
        elements.audio.get(0).play();
    });
    setInterval(function() {
        if (!dynamic_buttons())
        {
            $.ajax({
                type: 'GET',
                url: '/update/',
                success: function (data, textStatus) {
                    list(data);
                    paused = elements.audio.get(0).paused;
                    if (total() == 0) {
                        currentTrack = 0;
                        elements.audio.attr('src', '');
                        elements.title.text('');
                    } else {
                        src = elements.audio.get(0).src;
                        if (tracks().includes(src)) {
                            index = tracks().indexOf(src) + 1;
                            if (currentTrack !== index)
                            {
                                currentTrack = index;
                            }
                        } else {
                            currentTrack = 1;
                            elements.audio.attr('src', current_url);
                            elements.title.text(current_title);
                            if (!paused) elements.audio.get(0).play();
                        }
                    }
                }
            });
        }
    }, 5000);
});