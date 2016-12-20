var $controls;

var $play_pause;
var $play;
var $pause;

var $stop;

var $volume;
var $volume_mute;
var $volume_low;
var $volume_high;

var $volume_slider;
var $volume_handle;
var $volume_active;

$(document).ready(doc_ready_controls());

var playing;

var oldvolume;

var volume_slider_active = false;

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
    
    $play_pause.click(function () {
        if (!playing) {
            audio.play();
        } else {
            audio.pause();
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
    
    $volume_slider.mousedown(function (event) {
        volume_slider_active = true;
        calc_volume_slider({x: event.pageX, y: event.pageY});
    });
    $(document).mouseup(function () {
        volume_slider_active = false;
    });
    $(document).mousemove(function (event) {
        if (volume_slider_active) {
            calc_volume_slider({x: event.pageX, y: event.pageY});
        }
    });
    
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
            change_time(function (time) {
                return time - 10;
            });
        } else if (event.which == 108) {
            // Forward 10 seconds
            change_time(function (time) {
                return time + 10;
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
    
    update_volume_slider();
}
function update_volume_slider() {
    var handle_pos = $volume_slider.width() * audio.volume;
    $volume_handle.css('left', handle_pos - $volume_handle.width() / 2);
    $volume_active.css('width', handle_pos);
}
function calc_volume_slider(mousePos) {
    var volume_slider_offset = $volume_slider.offset();
    mousePos = {x: (mousePos.x - volume_slider_offset.left), y: mousePos.y};
    var new_volume = mousePos.x / $volume_slider.width();
    new_volume = new_volume > 1 ? 1 : new_volume;
    new_volume = new_volume < 0 ? 0 : new_volume;
    audio.volume = new_volume;
}

// Can pass time or a function (inputs current time)
function change_time(change) {
    if (typeof change == "function") {
        audio.currentTime = change(audio.currentTime);
    } else {
        audio.currentTime = change;
    }
}

var controlsHidden = false;
function hide_controls() {
    $controls.fadeOut(0);
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