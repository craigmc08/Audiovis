var actx;
var audio;
var audiosrc;
var analyser;
var frequencydata;
var ctx;
var $ctx;

// Settings
var bars = 64;
var totalWidth = function (screenWidth) { return screenWidth * 0.8; };
var totalHeight = function (screenHeight) { return screenHeight * 0.4; };
var widthGapRatio = 0.3;

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
    
    // Setup Canvas
    ctx = document.getElementById('renderer').getContext('2d');
    $ctx = $('#renderer');
    set_canvas_size();
    
    $(window).resize(function () {
        set_canvas_size();
    });
    
    // Loop
    frame = 0;
    function renderFrame() {
        requestAnimationFrame(renderFrame);
        if (playing) {
            analyser.getByteFrequencyData(frequencydata);
            renderToRenderer(frame);

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
    update_volume();
    audio.volume = defaultVolume;
    
});

function renderToRenderer(frame) {
    
    ctx.clearRect(0, 0, $ctx.width(), $ctx.height());
    
    var barSize = getTotalWidth($ctx.width()) / getBars();
    var barWidth = barSize / (1 + getWidthGapRatio());
    var barGap = barWidth * getWidthGapRatio();
    
    barsHist.push(processFrequencyData(15 / $ctx.height()));
    
    drawBars($ctx.height(), $ctx.width(), 2, barsHist[frame]);
    
    
}

// For logarithmic approach to frequencies
var noteStep = 120 / bars;
var a = 2 ** (1/12);
// Create a [bars] long array of data from 0-1 from frequencydata
function processFrequencyData(min) {
    var barsMap = [];
    
    var l = 0;
    var h = 8;
    
    for (var i = 0; i < bars; i++) {
        
        barsMap.push(0);
        
        l = h;
        h = l*(a**noteStep);
        
        var rangeSize = 1;
        
        for (var j = Math.floor(l); j <= Math.floor(h); j++) {
            barsMap[i] += frequencydata[j];
            rangeSize++;
        }
                
        barsMap[i] /= rangeSize;
        barsMap[i] = Math.pow(barsMap[i], 2);
        barsMap[i] /= 65025;
        barsMap[i] *= 1;
        
        // Edge Fallof
        //var dist = Math.abs(i - bars / 2);
        //var mult = 1 - (dist / (bars / 2))**2;
        //barsMap[i] *= mult;
        
        
        barsMap[i] = barsMap[i] > 1 ? 1 : barsMap[i];
    }
    return barsMap;
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

// Get average frequency from range l-h from frequencydata
function frequencyrange(l, h) {
    
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

function set_canvas_size() {
    $ctx.attr('width', $(document).width());
    $ctx.attr('height', $(document).height());
}