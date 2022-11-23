import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'

(function() {
  const playlist = JSON.parse(process.env.PLAYLIST)

  const volume = localStorage.getItem('volume') ? +localStorage.getItem('volume') : 0.5
  let repeat = !!localStorage.getItem('repeat')
  let shuffle = !!localStorage.getItem('shuffle')
  let currentTrack = shuffle ? new Date().getTime() % playlist.length : 0
  let isPlaying = false
  let audio
  let timeout

  const format = (value) => isNaN(parseInt(value)) ? '00' : parseInt(value).toString().padStart(2, '0')

  const updateProgress = () => setProgress(audio.currentTime)

  const play = function() {
    audio.play()
    $('.playback').addClass('playing')
    timeout = setInterval(updateProgress, 500)
    isPlaying = true
    document.querySelector('li.playing').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const pause = function() {
    audio.pause()
    $('.playback').removeClass('playing')
    clearInterval(updateProgress)
    isPlaying = false
  }

  const setProgress = function(value) {
    const currentSecond = format(value % 60)
    const currentMinute = format(value / 60)
    const trackSecond = format(audio.duration % 60)
    const trackMinute = format(audio.duration / 60)
    const ratio = value / audio.duration * 100

    $('.timer').html(`${currentMinute}:${currentSecond}/${trackMinute}:${trackSecond}`)
    $('.progress .pace').css('width', ratio + '%')
    $('.progress .slider a').css('left', ratio + '%')
  }

  const setVolume = function(volume) {
    audio.volume = volume
    localStorage.setItem('volume', volume)
    const volumePercent = `${volume * 100}%`
    $('.volume .pace').css('width', volumePercent)
    $('.volume .slider a').css('left', volumePercent)
  }

  const switchTrack = function(i) {
    currentTrack = i

    if (currentTrack < 0) {
      currentTrack = playlist.length - 1
    }

    if (currentTrack >= playlist.length) {
      currentTrack = 0
    }

    $('audio').remove()
    loadMusic()
    if (isPlaying) {
      play()
    }
  }

  const shufflePlay = function() {
    const lastTrack = currentTrack
    do {
      currentTrack = new Date().getTime() % playlist.length
    } while (lastTrack === currentTrack)

    switchTrack(currentTrack)
  }

  const ended = function() {
    pause()
    audio.currentTime = 0
    isPlaying = true

    if (repeat) {
      play()
      return
    }

    if (shuffle) {
      shufflePlay()
      return
    }

    if (currentTrack < playlist.length) {
      switchTrack(++currentTrack)
    }
  }

  const beforeLoad = function() {
    const endVal = this?.seekable?.length ? this.seekable.end(0) : 0
    $('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%')
  }

  const loadMusic = function() {
    const item = playlist[currentTrack]
    $('.tag').html(`<h1>${item.title} - ${item.artist}</h1>`)
    $('#playlist li').removeClass('playing').eq(currentTrack).addClass('playing')
    audio = $('<audio>').html(`<source src="${item.mp3}">`).appendTo('#player')[0]
    audio.volume = $('.mute').hasClass('enable') ? 0 : volume
    audio.addEventListener('progress', beforeLoad, false)
    audio.addEventListener('durationchange', beforeLoad, false)
    audio.addEventListener('canplay', play, false)
    audio.addEventListener('ended', ended, false)
  }

  const init = function() {
    $('#playlist').html(playlist.map((item, index) => `<li data-index="${index}">${item.title} - ${item.artist}</li>`))

    if (shuffle) {
      $('.shuffle').addClass('enable')
    }

    if (repeat) {
      $('.repeat').addClass('enable')
    }

    loadMusic()
  }

  $('.playback').on('click', function() {
    $(this).hasClass('playing') ? pause() : play()
  })

  $('.rewind').on('click', function() {
    shuffle ? shufflePlay() : switchTrack(--currentTrack)
  })

  $('.fastforward').on('click', function() {
    shuffle ? shufflePlay() : switchTrack(++currentTrack)
  })

  $('#playlist').on('click', 'li', function() {
    switchTrack($(this).data('index'))
  })

  $('.repeat').on('click', function() {
    repeat = !repeat
    $(this).toggleClass('enable')
    repeat ? localStorage.setItem('repeat', true) : localStorage.removeItem('repeat')
  })

  $('.shuffle').on('click', function() {
    shuffle = !shuffle
    $(this).toggleClass('enable')
    shuffle ? localStorage.setItem('shuffle', true) : localStorage.removeItem('shuffle')
  })

  $('.mute').on('click', function() {
    if ($(this).hasClass('enable')) {
      setVolume($(this).data('volume'))
      $(this).removeClass('enable')
    } else {
      $(this).data('volume', audio.volume).addClass('enable')
      setVolume(0)
    }
  })

  $('.progress .slider')
    .slider({
      step: 0.1,
      slide: function(event, ui) {
        setProgress(audio.duration * ui.value / 100)
        $(this).addClass('enable')
        clearInterval(timeout)
      },
      stop: function(event, ui) {
        audio.currentTime = audio.duration * ui.value / 100
        $(this).removeClass('enable')
        timeout = setInterval(updateProgress, 500)
      }
    })

  $('.volume .slider')
    .slider({
      max: 1,
      min: 0,
      step: 0.01,
      value: volume,
      slide: function(event, ui) {
        setVolume(ui.value)
        $(this).addClass('enable')
        ui.value === 0 ? $('.mute').addClass('enable') : $('.mute').removeClass('enable')
      },
      stop() {
        $(this).removeClass('enable')
      }
    })
    .children('.pace')
    .css('width', volume * 100 + '%')

  init()
})()