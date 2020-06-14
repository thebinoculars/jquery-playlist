import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'

(function() {
  let playlist = [
    {
      title: 'Archangel',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjIxNF8/Archangel.mp3'
    },
    {
      title: 'Blackheart',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjIyNV8/Blackheart.mp3'
    },
    {
      title: 'Breath And Life',
      artist: 'Audiomachine',
      mp3: 'https://od.lk/d/NTVfNzQ1NjIyN18/Breath%20And%20Life.mp3'
    },
    {
      title: 'Empire Of Angels',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjIzNl8/Empire%20Of%20Angels.mp3'
    },
    {
      title: 'False King',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/s/NTVfNzQ1NjI0MF8/False%20King.mp3'
    },
    {
      title: 'Flight Of The Silverbird',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjI0OF8/Flight%20Of%20The%20Silverbird.mp3'
    },
    {
      title: 'For The Win',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjI1MF8/For%20The%20Win.mp3'
    },
    {
      title: 'Heart Of The Courage',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjI1NV8/Heart%20Of%20The%20Courage.mp3'
    },
    {
      title: 'Immortal',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/s/NTVfNzQ1NjI2MV8/Immortal.mp3'
    },
    {
      title: 'Man Of Steel',
      artist: 'UltimatuM',
      mp3: 'https://od.lk/d/NTVfNzQ1NjI3NF8/Man%20Of%20Steel.mp3'
    },
    {
      title: 'Protectors Of The Earth',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjI4Nl8/Protectors%20Of%20The%20Earth.mp3'
    },
    {
      title: 'Star Sky',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjMwM18/Star%20Sky.mp3'
    },
    {
      title: 'True Strength',
      artist: 'John Dreamer',
      mp3: 'https://od.lk/s/NTVfNzQ1NjMxNF8/True%20Strength.mp3'
    },
    {
      title: 'Victory',
      artist: 'Two Steps from Hell',
      mp3: 'https://od.lk/d/NTVfNzQ1NjMxOF8/Victory.mp3'
    }
  ];
  // Settings
  let repeat = localStorage.repeat || 0,
    shuffle = localStorage.shuffle || 'false',
    continous = true,
    autoplay = true;

  // Load playlist
  for (let i = 0; i < playlist.length; i++) {
    let item = playlist[i];
    $('#playlist').append('<li>' + item.title + ' - ' + item.artist + '</li>');
  }

  let time = new Date(),
    currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
    trigger = false,
    audio, timeout, isPlaying, playCounts;

  let play = function() {
    audio.play();
    $('.playback').addClass('playing');
    timeout = setInterval(updateProgress, 500);
    isPlaying = true;
    document.querySelectorAll('li.playing')[0].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  let pause = function() {
    audio.pause();
    $('.playback').removeClass('playing');
    clearInterval(updateProgress);
    isPlaying = false;
  }

  // Update progress
  let setProgress = function(value) {
    let currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
      ratio = value / audio.duration * 100,
      trackMinute = parseInt(audio.duration / 60),
      trackSecond = parseInt(audio.duration % 60) < 10 ? '0' + parseInt(audio.duration % 60) : parseInt(audio.duration % 60);
    trackMinute = isNaN(trackMinute) ? '00' : trackMinute;
    trackSecond = isNaN(trackSecond) ? '00' : trackSecond;

    $('.timer').html(parseInt(value / 60) + ':' + currentSec + ' / ' + trackMinute + ':' + trackSecond);
    $('.progress .pace').css('width', ratio + '%');
    $('.progress .slider a').css('left', ratio + '%');
  }

  let updateProgress = function() {
    setProgress(audio.currentTime);
  }

  // Progress slider
  $('.progress .slider').slider({
    step: 0.1,
    slide: function(event, ui) {
      $(this).addClass('enable');
      setProgress(audio.duration * ui.value / 100);
      clearInterval(timeout);
    },
    stop: function(event, ui) {
      audio.currentTime = audio.duration * ui.value / 100;
      $(this).removeClass('enable');
      timeout = setInterval(updateProgress, 500);
    }
  });

  // Volume slider
  let setVolume = function(value) {
    audio.volume = localStorage.volume = value;
    $('.volume .pace').css('width', value * 100 + '%');
    $('.volume .slider a').css('left', value * 100 + '%');
  }

  let volume = localStorage.volume || 0.5;
  $('.volume .slider').slider({
    max: 1,
    min: 0,
    step: 0.01,
    value: volume,
    slide: function(event, ui) {
      setVolume(ui.value);
      $(this).addClass('enable');
      $('.mute').removeClass('enable');
    },
    stop: function() {
      $(this).removeClass('enable');
    }
  }).children('.pace').css('width', volume * 100 + '%');

  $('.mute').click(function() {
    if ($(this).hasClass('enable')) {
      setVolume($(this).data('volume'));
      $(this).removeClass('enable');
    } else {
      $(this).data('volume', audio.volume).addClass('enable');
      setVolume(0);
    }
  });

  // Switch track
  let switchTrack = function(i) {
    let track = i;
    if (i < 0) {
      track = currentTrack = playlist.length - 1;
    } else if (i >= playlist.length) {
      track = currentTrack = 0;
    }

    $('audio').remove();
    loadMusic(track);
    if (isPlaying == true) play();
  }

  // Shuffle
  let shufflePlay = function() {
    let time = new Date(),
      lastTrack = currentTrack;
    currentTrack = time.getTime() % playlist.length;
    if (lastTrack == currentTrack) ++currentTrack;
    switchTrack(currentTrack);
  }

  // Fire when track ended
  let ended = function() {
    pause();
    audio.currentTime = 0;
    playCounts++;
    if (continous == true) isPlaying = true;
    if (repeat == 1) {
      play();
    } else {
      if (shuffle === 'true') {
        shufflePlay();
      } else {
        if (repeat == 2) {
          switchTrack(++currentTrack);
        } else {
          if (currentTrack < playlist.length) switchTrack(++currentTrack);
        }
      }
    }
  }

  let beforeLoad = function() {
    let endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
    $('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
  }

  // Fire when track loaded completely
  let afterLoad = function() {
    if (autoplay == true) play();
  }

  // Load track
  let loadMusic = function(i) {
    let item = playlist[i],
      newaudio = $('<audio>').html('<source src="' + item.mp3 + '">').appendTo('#player');

    $('.tag').html('<h1>' + item.title + ' - ' + item.artist + ' </h1>');
    $('#playlist li').removeClass('playing').eq(i).addClass('playing');
    audio = newaudio[0];
    audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
    audio.addEventListener('progress', beforeLoad, false);
    audio.addEventListener('durationchange', beforeLoad, false);
    audio.addEventListener('canplay', afterLoad, false);
    audio.addEventListener('ended', ended, false);
  }

  loadMusic(currentTrack);
  $('.playback').on('click', function() {
    if ($(this).hasClass('playing')) {
      pause();
    } else {
      play();
    }
  });
  $('.rewind').on('click', function() {
    if (shuffle === 'true') {
      shufflePlay();
    } else {
      switchTrack(--currentTrack);
    }
  });
  $('.fastforward').on('click', function() {
    if (shuffle === 'true') {
      shufflePlay();
    } else {
      switchTrack(++currentTrack);
    }
  });
  $('#playlist li').each(function(i) {
    let _i = i;
    $(this).on('click', function() {
      switchTrack(_i);
    });
  });

  if (shuffle === 'true') $('.shuffle').addClass('enable');
  if (repeat == 1) {
    $('.repeat').addClass('once');
  } else if (repeat == 2) {
    $('.repeat').addClass('all');
  }

  $('.repeat').on('click', function() {
    if ($(this).hasClass('once')) {
      repeat = localStorage.repeat = 2;
      $(this).removeClass('once').addClass('all');
    } else if ($(this).hasClass('all')) {
      repeat = localStorage.repeat = 0;
      $(this).removeClass('all');
    } else {
      repeat = localStorage.repeat = 1;
      $(this).addClass('once');
    }
  });

  $('.shuffle').on('click', function() {
    if ($(this).hasClass('enable')) {
      shuffle = localStorage.shuffle = 'false';
      $(this).removeClass('enable');
    } else {
      shuffle = localStorage.shuffle = 'true';
      $(this).addClass('enable');
    }
  });
})();