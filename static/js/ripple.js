var ripple = "<span class='ripple'></span>";
var ripple_buttons;

$(document).ready(doc_ready_ripple);

function doc_ready_ripple() {
    
    ripple_buttons = $('.ripple-effect')
    
    ripple_buttons.click(function () {
        
        var $this = $(this);
        $this.find('.ripple').remove();
        //$this.append($.parseHTML(ripple));
        $this.append("<span class='ripple'></span>");
        var ripple = $this.find('.ripple');
        
        var startLeft = ($this.offset().left) / 2;
        var startTop = ($this.offset().top) / 2;
        var endLeft = ($this.offset().left - $this.width() * 2.8) / 2;
        var endTop = ($this.offset().top - $this.height() * 2.8) / 2;
        
        ripple.css('width', $this.width());
        ripple.css('height', $this.height());
        ripple.css('left', startLeft);
        ripple.css('top', startTop);
        
        ripple.animate({
            width: ($this.width() * 2.8),
            height: ($this.height() * 2.8),
            left: endLeft,
            top: endTop,
            opacity: 0
        }, 250, function() {
            $(this).remove();
        });
    });
    
}