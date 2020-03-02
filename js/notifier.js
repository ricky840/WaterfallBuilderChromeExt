var notifier = (function(global) {
  "use strict";

	// Type: success, negative, info or nothing

	function createHtml(header, message, type) {
		let html = `
		<div class="ui ${type} message">
			<i class="close icon"></i>
			<div class="header" style="margin-bottom: 5px;">${header}</div>
			<div class="content">${message}</div>
		</div>`;

		return html;
	}	

	function show(notification) {
		let header = (_.has(notification, "header")) ? notification.header : "";
		let message = (_.has(notification, "message")) ? notification.message : "";
		let type = (_.has(notification, "type")) ? notification.type : "";
		let append = (_.has(notification, "append")) ? notification.append : false;

		let content = $("#notification").find(".content").html();
		if (append == true && !_.isEmpty(content)) {
		 	message = `${content}<br>${message}`;
		}
		let html = createHtml(header, message, type);
		$("#notification").html(html);
	}

	function editFormShow(notification) {
		let header = (_.has(notification, "header")) ? notification.header : "";
		let message = (_.has(notification, "message")) ? notification.message : "";
		let type = (_.has(notification, "type")) ? notification.type : "";
		let append = (_.has(notification, "append")) ? notification.append : false;
		let html = createHtml(header, message, type);
		clearEditForm();
		$("#edit-form-notification").html(html);
	}

	function copyFormShow(notification) {
		let header = (_.has(notification, "header")) ? notification.header : "";
		let message = (_.has(notification, "message")) ? notification.message : "";
		let type = (_.has(notification, "type")) ? notification.type : "";
		let append = (_.has(notification, "append")) ? notification.append : false;
		let html = createHtml(header, message, type);
		clearCopyForm();
		$("#copy-form-notification").html(html);
	}

	function clear() {
		$("#notification").html('');
	}

	function clearEditForm() {
		$("#edit-form-notification").html("");
	}

	function clearCopyForm() {
		$("#copy-form-notification").html("");
	}
 
  return {
		show: show,
		clear: clear,
		editFormShow: editFormShow,
		clearEditForm: clearEditForm,
		copyFormShow: copyFormShow,
		clearCopyForm: clearCopyForm
  }
})(this);
