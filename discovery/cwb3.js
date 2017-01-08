function Cwb() {
    
    /******** Styling ********/
    // For smoother loading, hide forms until everything is ready
/*   */
    
    this.view = function () {
        
        
        var viewPortWidth;
        var viewPortHeight;
        
        // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
        if (typeof window.innerWidth != 'undefined') {
            viewPortWidth = window.innerWidth,
            viewPortHeight = window.innerHeight
        }
        
        // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
        else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
            viewPortWidth = document.documentElement.clientWidth,
            viewPortHeight = document.documentElement.clientHeight
        }
        
        // older versions of IE
        else {
            viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
            viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
        }
        return[viewPortWidth, viewPortHeight];
    };
    
    this.iso = function () {
        iso = new Isotope("#canvas", {
            
            itemSelector: '.group-container',
            layoutMode: 'fitColumns',
            resize: true
        });
        
        function onArrange() {
            console.log('arrange done');
        }
        
        iso.once('arrangeComplete', function () {
            console.log('arrange done, just this one time');
        });
    };
    
    return true
}
