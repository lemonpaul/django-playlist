$(function() {
    setInterval(function() {
        if ($("button[name='play']").length == 0 && $("button[name='pause']").length)
        {
            $.ajax({
                type: 'GET',
                url: '/update/',
                success: function (data, textStatus) {
                    $('#_list').html(data);
                    paused = $('#audio')[0].paused;
                    if ($('#_list').find('div#track_title').length == 0)
                    {
                        currentTrack = 0;
                        $('#audio')[0].src = "";
                        $('#title')[0].innerText = "";
                    } else {
                        src = $('#audio')[0].src;
                        tracks = Array.from($('#_list').find('a#track_url')).map(a => a.href);
                        if (tracks.includes(src)) {
                            index = tracks.indexOf(src) + 1;
                            if (currentTrack !== index)
                            {
                                currentTrack = index;
                            }
                        } else {
                            currentTrack = 1;
                            $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
                            $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_artist')[0].innerText +
                                                       " - " +
                                                       $('#track'+currentTrack).find('div#track_title')[0].innerText;
                            if (!paused) $('#audio')[0].play();
                        }
                    }
                }
            });
        }
     }, 5000);
});