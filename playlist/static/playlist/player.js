$(function() {
    currentTrack = 0;
    if ($('#_list').find('div#track_title').length !== 0)
    {
        currentTrack = 1;
        $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
        $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_artist')[0].innerText + " - " + $('#track'+currentTrack).find('div#track_title')[0].innerText;
    }
    $('img.next').click(function (e) {
        e.preventDefault();
        paused = $('#audio')[0].paused;
        if (currentTrack !== 0)
        {
            $('div#track_index')[currentTrack-1].innerText = currentTrack;
            if (currentTrack == $('#_list').find('div#track_title').length)
            {
                currentTrack = 1;
            } else {
                currentTrack++;
            }
            $('div#track_index')[currentTrack-1].innerText = "*";
            $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
            $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_artist')[0].innerText + " - " + $('#track'+currentTrack).find('div#track_title')[0].innerText;
            if (!paused) $('#audio')[0].play();
        }
    });
    $('img.prev').click(function (e) {
        e.preventDefault();
        paused = $('#audio')[0].paused;
        if (currentTrack !== 0)
        {
            $('div#track_index')[currentTrack-1].innerText = currentTrack;
            if (currentTrack == 1)
            {
                currentTrack = $('#_list').find('div#track_title').length;
            } else {
                currentTrack--;
            }
            $('div#track_index')[currentTrack-1].innerText = "*";
            $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
            $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_artist')[0].innerText + " - " + $('#track'+currentTrack).find('div#track_title')[0].innerText;
            if (!paused) $('#audio')[0].play();
        }
    });
    $('#audio')[0].addEventListener("ended", function (e) {
        $('div#track_index')[currentTrack-1].innerText = currentTrack;
        if (currentTrack == $('#_list').find('div#track_title').length)
        {
            currentTrack = 1;
        } else {
            currentTrack++;
        }
        $('div#track_index')[currentTrack-1].innerText = "*";
        $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
        $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_artist')[0].innerText + " - " + $('#track'+currentTrack).find('div#track_title')[0].innerText;
        $('#audio')[0].play();
    }, false);
});