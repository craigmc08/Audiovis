var actx;
var audio;
var audiosrc;
var analyser;
var frequencydata;
var ctx;
var $ctx;

var $background;

var $currentM;
var $currentS;
var $durationM;
var $durationS;

var $el_r;

// Settings
var bars = 64;
var totalWidth = function (screenWidth) { return screenWidth * 0.8; };
var totalHeight = function (screenHeight) { return screenHeight * 0.4; };
var widthGapRatio = 0.3;
var mode = "element";

// Calculate Settings
function getBars() {
    return bars;
}
function getTotalWidth(screenWidth) {
    if (typeof totalWidth == "function") {
        return totalWidth(screenWidth);
    } else {
        return totalWidth;
    }
}
function getTotalHeight(screenHeight) {
    if (typeof totalHeight == "function") {
        return totalHeight(screenHeight);
    } else {
        return totalHeight;
    }
}
function getWidthGapRatio() {
    return widthGapRatio;
}
function getBarSize(screenWidth) {
    return getTotalWidth(screenWidth) / getBars();
}
function getBarWidth(screenWidth) {
    return getBarSize(screenWidth) / (1 + getWidthGapRatio());
}
function getBarGap(screenWidth) {
    return getBarWidth(screenWidth) * getWidthGapRatio();
}

var barsHist = [];
var color;
var frame;

var defaultVolume = 0.3;

$(document).ready(function doc_ready() {
    
    // Setup Audio Source
    actx = new AudioContext();
    audio = document.getElementById('audio');
    audiosrc = actx.createMediaElementSource(audio);
    analyser = actx.createAnalyser();
    analyser.fftSize = 2**13 * 2;
    audiosrc.connect(analyser);
    audiosrc.connect(actx.destination);
    frequencydata = new Uint8Array(analyser.frequencyBinCount);
    analyser.smoothingTimeConstant = 0.5;
    
    $currentM = $('.currentMin');
    $currentS = $('.currentSecond');
    $durationM = $('.durMin');
    $durationS = $('.durSecond');
    
    $background = $('#background');
    
    // Setup Renderer
    if (mode == "canvas") {
        ctx = document.getElementById('renderer').getContext('2d');
        $ctx = $('#renderer');
        set_canvas_size();

        $(window).resize(function () {
            set_canvas_size();
        });
        $('#el-renderer').hide();
    } else if (mode == "element") {
        // Create elements
        $el_r = $('#el-renderer');
        for (var i = 0; i < getBars(); i++) {
            var bar = "<div class='bar' id='b" + i + "'></div>";
            $el_r.append(bar);
        }
        $('#renderer').hide();
    }
    
    // Loop
    frame = 0;
    function renderFrame() {
        var render = mode == "canvas" ? renderFrame : adjustBars;
        requestAnimationFrame(renderFrame);
        if (playing) {
            var cur = [Math.floor(audio.currentTime / 60), leftPad(Math.floor(audio.currentTime % 60), 2)];
            var dur = [Math.floor(audio.duration / 60), leftPad(Math.floor(audio.duration % 60), 2)];
            $currentM.text(cur[0]);
            $currentS.text(cur[1]);
            $durationM.text(dur[0]);
            $durationS.text(dur[1]);
            scrubber.set_slider(audio.currentTime / audio.duration, scrubber);
            
            analyser.getByteFrequencyData(frequencydata);
            render(frame);
            
            //$background.css('background-color', hsl(180, 80, 5 + (frequencyrange(0, 250) / (255 / 9))));

            frame++;
        }
    }
    
    audio.play();
    renderFrame();
    audio.addEventListener('play', function () {
        playing = true;
        update_playing();
    });
    audio.addEventListener('pause', function () {
        playing = false;
        update_playing();
    });
    audio.addEventListener('volumechange', function () {
        update_volume();
    });
    audio.addEventListener('timeupdate', function () {
    });
    update_volume();
    audio.volume = defaultVolume;
    
});

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}
// http://stackoverflow.com/a/8043254

function renderToRenderer(frame) {
    
    ctx.clearRect(0, 0, $ctx.width(), $ctx.height());
    
    var barSize = getTotalWidth($ctx.width()) / getBars();
    var barWidth = barSize / (1 + getWidthGapRatio());
    var barGap = barWidth * getWidthGapRatio();
    
    barsHist.push(processFrequencyData());
    
    drawBars($ctx.height(), $ctx.width(), 2, barsHist[frame]);
    
    
}

function adjustBars(frame) {
    var $bd = $('body');
    var barSize = getBarSize($bd.width());
    var barWidth = getBarWidth($bd.width());
    var barGap = getBarGap($bd.width());
    var barHeight = getTotalHeight($bd.height());
    
    var firstX = ($bd.width() - getTotalWidth($bd.width())) / 2;
    
    barsHist.push(processFrequencyData());
    
    // Loop through bars and set heights and widths and positions
    for (var i = 0; i < getBars(); i++) {
        var bHeight = barsHist[frame][i] * barHeight;
        bHeight = bHeight < 2 ? 2 : bHeight;
        var y = $bd.height() / 2;
        var x = firstX + i * barSize;
        $el = $('#b' + i);
        $el.css('left', x);
        $el.css('bottom', y);
        $el.css('height', bHeight);
        $el.css('width', barWidth);
    }
}

function drawBars(height, width, minHeight, data) {
    var barSize = getBarSize(width);
    var barWidth = getBarWidth(width);
    var barGap = getBarGap(width);
    var barHeight = getTotalHeight(height);
    var totalwidth = getTotalWidth(width);
    var firstX = (width - totalwidth) / 2;
    var calcLastX = firstX + (getBars() * barSize);
    var bottom = height / 2;
    
    var lastX = 0;
    var barsDrawn = 0;
    var drawnWidth = 0;
    
    for (var i = 0; i < getBars(); i++) {
        var dHeight = data[i] * barHeight;
        dHeight = dHeight < minHeight ? minHeight : dHeight;
        dHeight = Math.floor(-dHeight);
        //dHeight = 50;
        var x = Math.floor(firstX + i * barSize);
        var y = Math.floor(bottom);
        var dWidth = Math.floor(barWidth);
        
        lastX = x;
        barsDrawn++;
        drawnWidth += barSize;
        
        //ctx.fillStyle = rgba(0, 0, 0, 0.27);
        //ctx.fillRect(x + 5, y, dWidth, dHeight - 5);
        ctx.fillStyle = rgb(255, 255, 255);
        ctx.fillRect(x, y, dWidth, dHeight);
    }
    
}

function drawWave(height, width, lineSize, centerX, bottom, data, opacity) {
    var firstX = centerX - (lineSize * data.length / 2);
    
    ctx.beginPath();
    var lastX = firstX;
    
    for (var i = 0; i < data.length; i++) {
        var dHeight = Math.floor(data[i] * -height);
        var x = firstX + i * lineSize + lineSize / 2 - 3;
        var y = bottom + dHeight;
        
        ctx.strokeStyle = rgba(255, 255, 255, opacity);
        ctx.lineWidth = 2;
        
        if (i == 0) ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        
        lastX = x;
        
    }
    ctx.stroke();
}

// For logarithmic approach to frequencies
var noteStep = 120 / bars;
var a = 2 ** (1/12);
// Create a [bars] long array of data from 0-1 from frequencydata
function processFrequencyData() {
    var barsMap = [];
    
    var l = 0;
    var h = 8;
    
    for (var i = 0; i < bars; i++) {
        
        barsMap.push(0);
        
        l = h;
        h = l*(a**noteStep);
        
        barsMap[i] = frequencyrange(l, h);
        barsMap[i] = Math.pow(barsMap[i], 2);
        barsMap[i] /= 65025;
        barsMap[i] *= 1;
        
        
        barsMap[i] = barsMap[i] > 1 ? 1 : barsMap[i];
    }
    return barsMap;
}

// Get average frequency from range l-h from frequencydata
function frequencyrange(l, h) {
    var sum = 0;
    var count = 2; // Start 2 because l and h are outside of loop
    
    sum += frequencydata[Math.floor(l)] * (l % 1);
    sum += frequencydata[Math.floor(h + 1)] * (h % 1);
    
    for (var i = Math.floor(l + 1); i < Math.floor(h); i++) {
        sum += frequencydata[i];
        count++;
    }
    
    sum /= count;
    
    return sum;
}

function rgb(r, g, b) {
    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);
    return rgba(r, g, b, 1);
}
function rgba(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function hsl(h, s, l) {
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function set_canvas_size() {
    $ctx.attr('width', $(document).width());
    $ctx.attr('height', $(document).height());
}