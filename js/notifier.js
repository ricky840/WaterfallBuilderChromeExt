var notifier = (function(global) {
  "use strict";

	// Type: success, negative, info

	function createHtml(header, message, type) {
		let html = `
		<div class="ui ${type} message">
			<i class="close icon"></i>
			<div class="header">${header}</div>${message}
		</div>`;

		return html;
	}	

	function show(notification) {
		let header = (_.has(notification, "header")) ? notification.header : "";
		let message = (_.has(notification, "message")) ? notification.message : "";
		let type = (_.has(notification, "header")) ? notification.type : "";

		let html = createHtml(header, message, type);

		$("#notification").html(html);

    return true;
	}
 
  return {
		show: show
  }
})(this);
