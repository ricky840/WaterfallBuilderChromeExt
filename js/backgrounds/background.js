"use strict";

// Storage Init ------------------------------------------------------
var initSession = function() {
  console.log("Initializing Session");
  sessionHandler.loadSession().then(function(result) {
		sessionHandler.updateSessionData(result);	
    console.log("Session Loaded");
  }); 
}

var initStorage = function() {
  console.log("Initializing Storage");
  chrome.storage.local.get("sessionInfo", function(result) {
    if(_.isUndefined(result['sessionInfo'])) {
      chrome.storage.local.set({ sessionInfo: {} });
    } else if (!_.isEmpty(result['sessionInfo'])) {
      initSession();
    }
  });
	// Init customHtmlStore
  chrome.storage.local.get("customHtmls", function(result) {
    if(_.isUndefined(result["customHtmls"])) {
      chrome.storage.local.set({ customHtmls: {} });
    }
	});
}

// Popup Window, open only when the badge is up
chrome.browserAction.onClicked.addListener(function(tab) {

	// See if popup is already open. Only allow one window. Focuse existing window.
  let views = chrome.extension.getViews({type: "tab"});
	if (views.length >= 1) {
		chrome.windows.update(WindowId, { focused: true }, function() {
			console.log("Window focused");
		});
		return false;
	}

	if(badgeManager.getBadgeStaus()) {
		chrome.windows.create({
			url: chrome.runtime.getURL("popup.html"),
			type: "popup"
		}, function(window) {
			console.log(window);
			WindowId = window.id
			// Do something after open window
		});
	} else {
		// Notification
		let options = {
			type: "basic",
			title: "Login to MoPub Dashboard",
			message: "If you are already logged in, open MoPub UI and hit refresh.",
			iconUrl: LogoImageUrl
		};
		chrome.notifications.create(getCurrentDatetimeUTC(), options);
	}
});

// Fire when ext installed
chrome.runtime.onInstalled.addListener(function(event) {
  initStorage();

  if (event.reason === 'install') {
    chrome.storage.local.set({freshInstalled: true, extUpdated: false}, function() {
      console.log("Extension Installed");
    });
  }
  if (event.reason === 'update') {
    chrome.storage.local.set({extUpdated: true, freshInstalled: false}, function() {
      console.log("Extension Updated");
    })
  }
});

// Fires when the ext starts(very first time) or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initStorage();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initStorage();
};

function cookieParser(rawCookie) {
	let cookies = rawCookie.split(";");

	let reSessionId = /sessionid=/;
	let reSudoEmail = /sudoed_user_email=/;
	let reSudoUserId = /sudoed_user_id=/;
	let reMoPubAccountId = /mopub_account=/;
	let sessionData = {};

	for (let i=0; i < cookies.length; i++) {
		let eachCookie = cookies[i].trim();
		if (reSessionId.test(eachCookie)) {
			sessionData.sessionId = eachCookie.match(/^sessionid=(.*)/i)[1];
		} else if (reSudoEmail.test(eachCookie)) {
			sessionData.sudoEmail = eachCookie.match(/^sudoed_user_email="(.*)"/i)[1];	
		} else if (reSudoUserId.test(eachCookie)) {
			sessionData.sudoUserId = eachCookie.match(/^sudoed_user_id=(.*)/i)[1];
		} else if (reMoPubAccountId.test(eachCookie)) {
			sessionData.moPubAccountId = eachCookie.match(/^mopub_account=(.*)/i)[1];
		} else {
			//
		}
	}
	return sessionData;
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
		let rawData = details.requestBody.raw[0].bytes;
		let postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(rawData)));
		try {
			let userInput = JSON.parse(postedString);
			console.log("Entered account id and password")
			console.log(userInput);
			loginHandler.setPreLoginEmail(userInput.username);
		} catch (e) {
			console.log(`Error parsing user account info ${e.message}`);
		}
	},
	{
		urls: [
			"*://*.mopub.com/web-client/api/user/login",
			"*://*.mopub.com/web-client/api/user/login/"
		]
	}, 
	["requestBody"]
);

// Update Session Info if it is different from the loaded one.
// This shouldn't block request timing. Happens async
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    let headers = details.requestHeaders;
    let csrfTokenFromReqHeader = "";
    let sessionData = {};

    for (let i=0; i < headers.length; i++) {
      let name = headers[i].name.toLowerCase().trim();
      let value = headers[i].value.trim();
      switch(name) {
        case "x-csrftoken":
					csrfTokenFromReqHeader = value;
					break;
        case "cookie":
					sessionData = cookieParser(value);
					break;
        default:
          // Do Nothing
					break;
      }
    }
		sessionData.csrfToken = csrfTokenFromReqHeader;
		// Update session data
		sessionHandler.updateSessionData(sessionData);
  },
  {
    urls: [
      "https://app.mopub.com/*",
      "https://app.mopub.com/"
    ]
  }, 
  ["requestHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(loginHandler.processLoginResult, 
  {
    urls: [
      "*://*.mopub.com/web-client/api/user/login",
      "*://*.mopub.com/web-client/api/user/login/"
    ]
  }, 
  ["responseHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(logoutHandler, 
  {
    urls: [
      "*://*.mopub.com/account/logout",
      "*://*.mopub.com/account/logout/"
    ]
  }, 
  ["responseHeaders", "extraHeaders"]
);

// user visits login page only the session is expired.
chrome.webRequest.onCompleted.addListener(function(detail) {
		console.log("Session expired");
		sessionHandler.clearSession();
		loginHandler.setPreLoginEmail();
		badgeManager.removeBadge();
	}, 
  {
    urls: [
      "*://app.mopub.com/login*"
    ]
  }, 
  ["responseHeaders", "extraHeaders"]
);

// Listen to API update requests and add Referer / CSRF token header
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    let headers = details.requestHeaders;
    let hasReferer = false;
    let hasCsrfToken = false;

    for (let i=0; i < headers.length; i++) {
      let name = headers[i].name.toLowerCase();
      if (name == "referer") {
        hasReferer = true;
      } else if (name == "x-csrftoken") {
        hasCsrfToken = true;
      }
    }

    if (!hasReferer) {
      headers.push({
        name: "Referer",
        value: "https://app.mopub.com"
      });
    }

    if (!hasCsrfToken) {
			console.log(sessionHandler.getSession());
      headers.push({
        name: "x-csrftoken",
        value: sessionHandler.getSession().csrfToken
      });
    }

    return { "requestHeaders": headers };
  },
  {
    urls: [ 
      "https://app.mopub.com/web-client/api/ad-units/update-ad-source*",
      "https://app.mopub.com/web-client/api/line-items/update*",
      "https://app.mopub.com/web-client/api/line-items/create*",
			"https://app.mopub.com/web-client/api/orders/create*"
    ]
  },
  ["requestHeaders", "extraHeaders", "blocking"]
);
