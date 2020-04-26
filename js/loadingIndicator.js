var loadingIndicator = (function(global) {
	"use strict";

	let barLoader;
	let barLength;

	function init(barObj) {
		barLoader = barObj;
	}

	function showBarLoader() {
		barLoader.progress('reset');
		barLoader.css('visibility', 'visible');
	}

	function hideBarLoader() {
		setTimeout(function() { 
			barLoader.css('visibility', 'hidden');
			barLoader.progress('reset');
		}, 500);
	}

	function increaseBar() {
		barLoader.progress('increment');
	}

	function setTotalBarLoader(total) {
		barLength = total;
		barLoader.progress({
			total: total
		});
	}

	function getBarLength() {
		return barLength;
	}
 
  return {
		init: init,
		showBarLoader: showBarLoader,
		hideBarLoader: hideBarLoader,
		increaseBar: increaseBar,
		setTotalBarLoader: setTotalBarLoader,
		getBarLength: getBarLength
  }
})(this);
