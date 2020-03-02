$(document).ready(function() { 
	let urlParams = new URLSearchParams(window.location.search);
	let key = (urlParams.get('key'));
	customHtmlStore.load(key).then(function(html) {
		$("#html").text(html);
	});
});


