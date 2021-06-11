var sessionHandler = (function(global) {
  "use strict";

	let sessionCache = {};

  function saveSession(sessionData) {
		chrome.storage.local.set({ sessionInfo: sessionData }, function() {
			sessionCache = sessionData;
			// console.log("Session Saved");
			// console.log(sessionData);
			// console.log("Session Cache Updated");
			// console.log(sessionCache);
		});
  }

  function loadSession() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get("sessionInfo", function(result) {
        let sessionData = result["sessionInfo"];
        resolve(sessionData);
      });
    });
  }

  function getSession() {
    return sessionCache;
	}

  function clearSession() {
		sessionCache = {};
    chrome.storage.local.set({ sessionInfo: {} }, function() {
      console.log("Session Cleared");
			return true;
    });
  }

	/**
	 * When account was changed
	 */
	async function updatePopUpUIEmail() {
		let views = chrome.extension.getViews({type: "tab"});
		if (views.length > 0) {
			const popup = views[0];
			await popup.accountManager.loadUserInfo();
			await popup.accountManager.loadAccountInfo();
			const currentAccount = popup.accountManager.getCurrentAccount();
			const company = _.has(currentAccount, "company") ? currentAccount.company : "Unknown";
			popup.notifier.show({
				header: `Account changed in MoPub dashboard`,
				message: `You just sudoed into the account <span class="sudo-company">${company}</span>. Please make sure to use the right API Key.`,
				type: "negative"
			});
		}
	}

	function updateSessionData(newSessionData) {
		if (!_.isEmpty(newSessionData.csrfToken) && sessionCache.csrfToken != newSessionData.csrfToken) {
			sessionCache.csrfToken = newSessionData.csrfToken;
			console.log(`CsrftToken updated ${newSessionData.csrfToken}`);
		}
		if (!_.isEmpty(newSessionData.sessionId) && sessionCache.sessionId != newSessionData.sessionId) {
			sessionCache.sessionId = newSessionData.sessionId;
			console.log(`SessionId updated ${newSessionData.sessionId}`);
		}
		if (!_.isEmpty(newSessionData.accountEmail) && sessionCache.accountEmail != newSessionData.accountEmail) {
			sessionCache.accountEmail = newSessionData.accountEmail;
			console.log(`AccountEmail updated ${newSessionData.accountEmail}`);
		}
		if (!_.isEmpty(newSessionData.sudoEmail) && sessionCache.sudoEmail != newSessionData.sudoEmail) {
			sessionCache.sudoEmail = newSessionData.sudoEmail;
			console.log(`SudoEmail updated ${newSessionData.sudoEmail}`);
			updatePopUpUIEmail();
		}
		if (!_.isEmpty(newSessionData.sudoUserId) && sessionCache.sudoUserId != newSessionData.sudoUserId) {
			sessionCache.sudoUserId = newSessionData.sudoUserId;
			console.log(`SudoUserId updated ${newSessionData.sudoUserId}`);
		}
		if (!_.isEmpty(newSessionData.moPubAccountId) && sessionCache.moPubAccountId != newSessionData.moPubAccountId) {
			sessionCache.moPubAccountId = newSessionData.moPubAccountId;
			console.log(`MoPubAccountId updated ${newSessionData.moPubAccountId}`);
		}
		saveSession(sessionCache);

		// If csrfToken and SessionId exists which all we need, then set badge.
		if (!_.isEmpty(sessionCache.csrfToken) && !_.isEmpty(sessionCache.sessionId)) {
			badgeManager.setBadge();
		} else {
      badgeManager.removeBadge();
		}
	}
 
  return {
		saveSession: saveSession,
    getSession: getSession,
    clearSession: clearSession,
    loadSession: loadSession,
		updateSessionData: updateSessionData
  }
})(this);
