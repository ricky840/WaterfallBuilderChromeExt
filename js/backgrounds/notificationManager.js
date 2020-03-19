var notificationManager = (function(global) {
  "use strict";

	const notificationLogoImage = "img/default-logo.png";

	function show(notification) {
		let options = {
			type: "basic",
			title: notification.title,
			message: notification.message,
			iconUrl: notificationLogoImage
		};

		// if there is id
		if ("id" in notification) {
			chrome.notifications.create(`${notification.id}-${getCurrentDatetimeUTC()}`, options);
		} else {
			chrome.notifications.create(getCurrentDatetimeUTC(), options);
		}
	}

	// actions when onClick notification popup
	function onClicked(notificationId) {
		if (notificationId.includes("take_me_to_mopub_ui")) {
			chrome.tabs.create(
			{
				url: "https://app.mopub.com",
				active: true
			}, function(tab) {
				// bring window to the front
				chrome.windows.update(tab.windowId, {focused: true});
			});
		}

		if (notificationId.includes("adUnitId-")) {
			let adUnitId = notificationId.split("-")[1];
			chrome.tabs.create(
			{
				url: "https://app.mopub.com/ad-unit?key=" + adUnitId,
				active: true
			}, function(tab) {
				// bring window to the front
				chrome.windows.update(tab.windowId, {focused: true});
			});
		}
	}

  return {
		show: show,
		onClicked: onClicked	
  }
})(this);
