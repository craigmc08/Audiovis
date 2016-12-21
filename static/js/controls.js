var $controls;

var $play_pause;
var $play;
var $pause;

var $stop;

var $volume;
var $volume_mute;
var $volume_low;
var $volume_high;

var volume_slider;
var $volume_slider;
var $volume_handle;
var $volume_active;

var scrubber;
var $scrubber;
var $scrubber_handle;
var $scrubber_active;

$(document).ready(doc_ready_controls());

var playing;

var oldvolume;

var volume_slider_active = false;

function gen_theme_style(colorHS) {
    return '.color--theme { background-color: ' + hsl(colorHS[0], colorHS[1], 50) + '; } .color--theme-dark { background-color: ' + hsl(colorHS[0], colorHS[1], 10) + '; }';
}

function doc_ready_controls() {
    
    
    
    $controls = $('#controls');
    
    $play_pause = $('#controls .play-pause')
    $play = $('#controls .play');
    $pause = $('#controls .pause');
    
    $stop = $('#controls .stop');
    
    $volume = $('#controls .volume');
    $volume_mute = $('#controls .volume .mute');
    $volume_low = $('#controls .volume .low');
    $volume_high = $('#controls .volume .high');
    
    $volume_slider = $('#controls .volume-slider');
    $volume_handle = $('#controls .volume-slider .volume-handle');
    $volume_active = $('#controls .volume-slider .volume-active');
    
    $scrubber = $('.scrubber');
    $scrubber_handle = $('.scrubber-handle');
    $scrubber_active = $('.scrubber-active');
    
    $play_pause.click(function () {
        if (!playing) {
            audio.play();
            if (controlsHidden) { hide_controls() };
        } else {
            audio.pause();
            if (controlsHidden) { show_controls() };
        }
    });
    $stop.click(function () {
        if (playing) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    
    $volume.click(function () {
        if (audio.volume !== 0) {
            oldvolume = audio.volume;
            audio.volume = 0;
        } else {
            audio.volume = oldvolume;
        }
    });
    
    // Setup volume slider
    volume_slider = new Slider($volume_slider, $volume_handle, $volume_active, set_volume, function () {}, 0, 1);
    
    // Setup time slider
    scrubber = new Slider($scrubber, $scrubber_handle, $scrubber_active, scrubber_update, scrubber_state, 0, 1);
    
    resetTimer();
    show_controls();
    $(document).bind('mousemove keypress click', resetTimer);
    
    // Keyboard Shortcuts
    $(document).keypress(function (event) {
        if (event.which == 107) {
            $play_pause.click();
        } else if (event.which == 109) {
            $volume.click();
        } else if (event.which == 106) {
            // Back 10 seconds
            change_time(function (audio) {
                return audio.currentTime - 10;
            });
        } else if (event.which == 108) {
            // Forward 10 seconds
            change_time(function (audio) {
                return audio.currentTime + 10;
            });
        } else if (event.which == 104) {
            controlsHidden = !controlsHidden;
            if (controlsHidden) {
                hide_controls();
            } else {
                show_controls();
            }
        }
    });
    
}

function update_playing() {
    if (playing) {
        $play.hide();
        $pause.show();
    } else {
        $play.show();
        $pause.hide();
    }
}
function update_volume(hideall) {
    if (hideall) {
        $volume_mute.hide();
        $volume_low.hide();
        $volume_high.hide();
        return;
    }
    
    if (audio.volume == 0) {
        update_volume(true);
        $volume_mute.show();
    } else if (audio.volume <= 0.5) {
        update_volume(true);
        $volume_low.show();
    } else {
        update_volume(true);
        $volume_high.show();
    }
    
    volume_slider.set_slider(audio.volume, volume_slider);
}
function set_volume(value) {
    audio.volume = value;
}

function scrubber_update(value) {
    change_time(function scrubber_update_time_change(audio) {
        return audio.duration * value;
    });
}
function scrubber_state(state) {
    console.log('state update:' + state);
    if (state) {
        audio.pause();
    } else {
        audio.play();
    }
}
// Can pass time or a function (inputs current time)
function change_time(change) {
    if (typeof change == "function") {
        audio.currentTime = change(audio);
    } else {
        audio.currentTime = change;
    }
}

var controlsHidden = false;
function hide_controls() {
    if (typeof audio == 'undefined') {
        return;
    }
    if (!audio.paused) {
        $controls.fadeOut(0);
    }
}
function show_controls() {
    $controls.fadeIn(100);
}

// Hide controls if no input for 2 seconds
var timeout = 2; // Seconds
var idleTimer;
function resetTimer() {
    if (!controlsHidden) {
        show_controls();
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hide_controls, timeout * 1000);
}