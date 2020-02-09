$(function() {
    $('#search_form').hide();
    $('#_search').hide();

    $('#add').click(function(event) {
        event.preventDefault();
        $('#search_form').show();
        $('#add_form').show();
        $('#add').hide();
    });

    $('#delete_form').submit(function(event) {
        event.preventDefault();
        delete_ids = Array.from($('#delete_form').find('input:checkbox:checked'), checkbox => parseInt(checkbox.parentNode.parentNode.id.substring(5)));
        count = $('#_list').find('div#track_title').length;
        delete_count = delete_ids.length;
        if (count - delete_count == 0)
        {
            currentTrack = 0;
        } else if (delete_ids.includes(currentTrack)) {
            ids = Array.from(Array(count).keys(), key => ++key).filter(id => !delete_ids.includes(id));
            if (count - currentTrack > delete_ids.filter(id => id > currentTrack).length) {
                index = ids.filter(id => id > currentTrack)[0];
                currentTrack = index - delete_ids.filter(id => id < index).length;
            } else {
                index = ids.filter(id => id < currentTrack)[0];
                currentTrack = index - delete_ids.filter(id => id < index).length;
            }
        } else {
            currentTrack -= delete_ids.filter(id => id < currentTrack).length;
        }
        $.ajax({
            type: 'POST',
            url: '/delete/',
            data: $('#delete_form').serialize(),
            success: function (data, textStatus) {
                $('#_list').html(data);
                paused = $('#audio')[0].paused;
                if (currentTrack == 0) {
                    $('#audio')[0].src = "";
                    $('#title')[0].innerText = "";
                } else {
                    $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_title')[0].innerText;
                    if ($('#audio')[0].src !== $('#track'+currentTrack).find('a#track_url')[0].href)
                    {
                        $('#audio')[0].src = $('#track'+currentTrack).find('a#track_url')[0].href;
                        if (!paused) $('#audio')[0].play();
                    }
                }
            }
        });
    });

    $('#search_form').submit(function(event) {
        event.preventDefault();
        $.ajax({
            type: 'GET',
            url: '/search/',
            data: $('#search_form').serialize(),
            success: function (data, textStatus) {
                $('#_search').show();
                $('#_search').html(data);
            }
        });
    });

    setInterval(function() {
        if ($(':checkbox:checked').length == 0)
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
                            $('#title')[0].innerText = $('#track'+currentTrack).find('div#track_title')[0].innerText;
                            if (!paused) $('#audio')[0].play();
                        }
                    }
                }
            });
        }
     }, 5000);
});