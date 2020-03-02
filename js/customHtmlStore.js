var customHtmlStore = (function(global) {
  "use strict";

	function save(key, html) {
		chrome.storage.local.get("customHtmls", function(result) {
			let htmls = result["customHtmls"];
			htmls[key] = html;
			chrome.storage.local.set({customHtmls: htmls}, function() {
				console.log("CustomHtmls Saved");
			});
		});
	}	

	function load(key) {
		return new Promise(function(resolve, reject){
			chrome.storage.local.get("customHtmls", function(result) {
				let htmls = result["customHtmls"];
				resolve(htmls[key]);
			});
		});
	}

	function reset() {
		chrome.storage.local.set({customHtmls: {}}, function() {
			console.log("Resetting Html Store");
		});
	}
 
  return {
		save: save,
		load: load,
		reset: reset
  }
})(this);
