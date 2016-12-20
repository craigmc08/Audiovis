// Functionality for easily creating sliders with JQuery


// Params:
//  bar: jquery object, main bar of slider
//  handle: thing that moves to where value is
//  active_bar: shows to left of handle
//  on_update: called when slider value changes with parameters (value)
//  min, max: minimum and maximum value of slider
class Slider {
    constructor(bar, handle, active_bar, on_update, min, max) {
        this.bar = bar;
        this.handle = handle;
        this.active_bar = active_bar;
        this.on_update = on_update;
        this.range = {min: min, max: max};
        
        this.active = false;
        
        // Binding events
        var that = this;
        this.bar.mousedown(function (event) {
            that.mouse_down(event, that);
        });
        $(document).mousemove(function (event) {
            that.mouse_move(event, that);
        });
        $(document).mouseup(function (event) {
            that.mouse_up(that);
        });
    }
    
    set_slider(value, that) {
        // Ensure value is between min and max
        value = value > that.range.max ? that.range.max : value;
        value = value < that.range.min ? that.range.min : value;
        
        // Put value between [0, 1]
        value = (value - that.range.min) / (that.range.max - that.range.min);
        
        // Map to width of bar
        var position = value * that.bar.width();
        that.handle.css('left', position - that.handle.width() / 2);
        that.active_bar.css('width', position);
    }
    
    calc_value(mouseX, that) {
        var start = that.bar.offset().left;
        var end = that.bar.offset().left + that.bar.width();
        var position = mouseX - that.bar.offset().left;
        position = position < 0 ? 0 : position > that.bar.width() ? that.bar.width() : position;
        var value = position / that.bar.width();
        value =  value * that.range.max + that.range.min;
        this.set_slider(value, that);
        this.on_update(value);
    }
    
    mouse_down(event, that) {
        that.active = true;
        that.calc_value(event.pageX, that);
    }
    
    mouse_move(event, that) {
        if (that.active) {
            that.calc_value(event.pageX, that);
        }
    }
    
    mouse_up(that) {
        that.active = false;
    }
}