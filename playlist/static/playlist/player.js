var currentTrack = 0;

var currentVolume = 1;

var current_url = function() { return $('#track'+currentTrack).find('a#track_url').attr('href'); };

var current_title = function() { return $('#track'+currentTrack).find('div#track_artist').text() +
                                        " - " + $('#track'+currentTrack).find('div#track_title').text(); };

var current_index = function(index) { $('div#track_index').get(currentTrack-1).innerText = index; };

var current_time = function() {
    return (!isNaN(elements.audio.get(0).duration)) ? Math.floor(elements.audio.get(0).currentTime / 60) +
                                                     ':' +
                                                     (Math.floor(elements.audio.get(0).currentTime) -
                                                      Math.floor(elements.audio.get(0).currentTime / 60) * 60).toString().padStart(2, '0') +
                                                     '/' +
                                                     Math.floor(elements.audio.get(0).duration / 60) +
                                                     ':' +
                                                     (Math.floor(elements.audio.get(0).duration) -
                                                      Math.floor(elements.audio.get(0).duration / 60) * 60).toString().padStart(2, '0') : '0:00/0:00';
};

var total = function() { return $('#_list').find('div#track_title').length; };

var dynamic_buttons = function() {
    return $('#_list').find($('img.play')).length !== 0 || $('#_list').find($('img.pause')).length !== 0;
};

var list = function(data) { $('#_list').html(data); };

var tracks = function() { return Array.from($('#_list').find('a#track_url')).map(a => a.href); };

var elements = {
    audio: $('#audio'),
    title: $('#title'),
    time: $('p.time'),
    next: $('img.next'),
    play: $('img.play'),
    pause: $('img.pause'),
    prev: $('img.prev'),
    position: $('input.position'),
    unmute: $('img.unmute'),
    mute: $('img.mute'),
    volume: $('input.volume')
};

elements.pause.parent().hide();
elements.unmute.parent().hide();
elements.position.val(0);

if (total() !== 0)
{
    currentTrack = 1;
    elements.audio.attr('src', current_url);
    elements.title.text(current_title);
}

$(function() {
    elements.time.text(current_time());
    elements.volume.val(1);
    elements.pause.click(function (e) {
        e.preventDefault();
        elements.audio.get(0).pause();
        elements.play.parent().show();
        elements.pause.parent().hide();
        elements.time.text(current_time());
    });
    elements.play.click(function (e) {
        e.preventDefault();
        if (currentTrack !== 0) {
            elements.audio.get(0).play();
            elements.pause.parent().show();
            elements.play.parent().hide();
            elements.time.text(current_time());
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
            elements.time.text(current_time());
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
            elements.time.text(current_time());
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
        elements.time.text(current_time());
    });
    elements.audio.on('timeupdate', function (e) {
        e.preventDefault();
        elements.time.text(current_time());
        if (currentTrack !== 0)
            elements.position.val(elements.audio.get(0).currentTime/elements.audio.get(0).duration);
        else
            elements.position.val(0);
    });
    elements.audio.on('loadedmetadata', function (e) {
        e.preventDefault();
        elements.time.text(current_time());
        elements.position.val(0);
    });
    elements.volume.change(function (e) {
        e.preventDefault();
        currentVolume = elements.volume.val();
        elements.audio.get(0).volume = currentVolume;
        if (elements.volume.val() == 0)  {
            elements.mute.parent().hide();
            elements.unmute.parent().show();
        } else {
            elements.mute.parent().show();
            elements.unmute.parent().hide();
        }
    });
    elements.position.change(function (e) {
        e.preventDefault();
        if (currentTrack !== 0)
            elements.audio.get(0).currentTime = elements.position.val() * elements.audio.get(0).duration;
        else
            elements.position.val(0);
    });
    elements.mute.click(function (e) {
        e.preventDefault();
        elements.audio.get(0).volume = 0;
        elements.volume.val(0);
        elements.mute.parent().hide();
        elements.unmute.parent().show();
    });
    elements.unmute.click(function (e) {
        e.preventDefault();
        currentVolume = (currentVolume == 0) ? 0.5 : currentVolume;
        elements.audio.get(0).volume = currentVolume;
        elements.volume.val(currentVolume);
        elements.mute.parent().show();
        elements.unmute.parent().hide();
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