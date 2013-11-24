/**
* Makes the element follow the screen (within the element's parent 
* or nearest ancestor having a position) as the user scrolls up and down 
* a page.  Optionally, you can specify stopping points within the parent
* where the element will cease following (e.g. at a header or footer).
*/
(function( $ ){
	function _pegToScreenTop($element){
		$element.css({
			'top':0,
			'bottom':''
		});				
	};
	function _pegToScreenBottom($element){
		$element.css({
			'top':'',
			'bottom':0
		});	
	};	
	function _pegToFollowTop($element, followTop, screenTop){
		$element.css({
			'top': followTop - screenTop,
			'bottom':''
		});
				
	};
	function _pegToFollowBottom($element, followBottom, screenBottom){
		$element.css({
			'top':'',
			'bottom': screenBottom - followBottom
		});	
	};
	function _scrollEl($element, distance){
		var oldTop = $element.offset().top - $(window).scrollTop();
		$element.css({
			'top': oldTop - (distance || 0),
			'bottom':''
		});
	}
		
	function follow(event){
		var $window = $(window),
			settings = event.data.settings,
			$element = event.data.follower,
			elHeight = $element.outerHeight(),
			elTop = $element.offset().top,
			elBottom = elTop + elHeight,
			isShorterThanScreen = elHeight < $window.height(),
			screenTop = $window.scrollTop(),				
			screenBottom = screenTop + $window.height(),
			isFollowTopPxVisible = screenTop - settings.topPixel <= 0,
			isFollowBottomPxVisible = settings.bottomPixel - screenBottom <= 0,
			prevScreenTop = ($element.data('followScreen') || 0),
			scrollDistance = screenTop - prevScreenTop;
		
		if(elHeight < settings.bottomPixel - settings.topPixel){ //El is capable of scrolling
			if( isShorterThanScreen ){
				if( isFollowTopPxVisible ){
					_pegToFollowTop($element, settings.topPixel, screenTop);
				} else if( isFollowBottomPxVisible && (settings.bottomPixel - screenTop < elHeight)){
					_pegToFollowBottom($element, settings.bottomPixel, screenBottom);
				} else {
					_pegToScreenTop($element);
				}
			} else { //El is bigger than screen
				if( isFollowBottomPxVisible ){
					_pegToFollowBottom($element, settings.bottomPixel, screenBottom);
				} else if( isFollowTopPxVisible ){
					_pegToFollowTop($element, settings.topPixel, screenTop);
				} else { //We're between the designated top and bottom following points
					if( scrollDistance < 0 ){ //Scrolling up
						if( Math.abs(scrollDistance) > (screenTop - elTop) ){ //Not enough of the element left off-screen to scroll the whole distance
							_pegToScreenTop($element);
						} else {
							_scrollEl($element, scrollDistance); //Scroll the element up the same distance the user scrolled
						}
					} else { //Scrolling down
						if( Math.abs(scrollDistance) > (elBottom - screenBottom) ){ //Not enough of the element left off-screen to scroll the whole distance
							_pegToScreenBottom($element);
						} else {
							_scrollEl($element, scrollDistance); //Scroll the element down the same distance the user scrolled
						}
					}
				}
			}
		}
		
		//Store for next time
		$element.data('followScreen', screenTop);
	}
	
	$.fn.followScreen = function( options ){
		var eventNumber = Math.floor(Math.random()*10^5),
			settings= $.extend( {
			  'topPixel'         : 0,
			  'bottomPixel' : Infinity
			}, options), 
			prevEventNumber = this.data('fsn');
			
		//Remove previous followScreen listener from this element
		if(prevEventNumber){
			$(window).off('scroll.followScreen.' + prevEventNumber, follow);
		}
		
		//Set listeners for scroll events
		return this.each(function(){
			var data = {follower: $(this), settings: settings};
			$(this).data('fsn', eventNumber).css('position','fixed');
			$(window).on('scroll.followScreen.' + eventNumber, data, follow);
			follow({data:data});
		});
	}
})(jQuery)