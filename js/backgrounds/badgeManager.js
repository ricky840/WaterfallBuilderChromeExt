var badgeManager = (function(global) {
  "use strict";

	let badgeStatus = false;
	let backgroundColor = "#F00";
	let message = "ON";

  function setBadge() {
    chrome.browserAction.setBadgeBackgroundColor({color: backgroundColor});
    chrome.browserAction.setBadgeText({text: message});
		badgeStatus = true;
    return true;
  }

  function removeBadge() {
    chrome.browserAction.setBadgeText({text: ""});
		badgeStatus = false;
  }

	function getBadgeStaus() {
		return badgeStatus;
	}

  return {
    setBadge: setBadge,
    removeBadge: removeBadge,
		getBadgeStaus: getBadgeStaus
  }

})(this);
