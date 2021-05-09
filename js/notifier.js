var notifier = (function(global) {
  "use strict";

	// Type: success, negative, info or nothing

	function createHtml(header, message, type) {
		return `
		<div class="ui ${type} message">
			<i class="close icon"></i>
			<div class="header" style="margin-bottom: 5px;">${header}</div>
			<p class="content">${message}</p>
		</div>`;
	}	

	function show(notification) {
		const header = (_.has(notification, "header")) ? notification.header : "";
		const message = (_.has(notification, "message")) ? notification.message : "";
		const type = (_.has(notification, "type")) ? notification.type : "";
		const html = createHtml(header, message, type);
		$("#notification").html(html);
	}

	function clear() {
		$("#notification").html("");
	}
 
  return {
		show: show,
		clear: clear
  }
})(this);
