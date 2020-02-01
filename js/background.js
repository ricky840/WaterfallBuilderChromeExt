"use strict";

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup"
  }, function(window) {
    // Do something after opening
  });
});

var badgeManager = function(global) {

  let backgroundColor = "#F00";
  let message = "UP";

  function setBadge() {
    chrome.browserAction.setBadgeBackgroundColor({color: backgroundColor});
    chrome.browserAction.setBadgeText({text: message});
    return true;
  }

  function removeBadge() {
    chrome.browserAction.setBadgeText({text: ""});
  }

  return {
    setBadge: setBadge,
    removeBadge: removeBadge
  }

}(this);

var loginHandler = function(details) {
  let responseHeaders = details.responseHeaders;
  let httpStatus, csrfToken, sessionId;

  for (let i = 0; i < responseHeaders.length; i++) {
    let headerObj = responseHeaders[i];

    switch(headerObj.name) {
      case "status":
        let statusCode = (headerObj.value).toString();
        if (statusCode.match(/20\d/) != null) {
          httpStatus = statusCode;
        }
      case "set-cookie":
        let setCookieValue = headerObj.value;
        let reToken = /csrftoken=/;
        let reSessionId = /sessionid=/;
        if (reToken.test(setCookieValue)) {
          csrfToken = setCookieValue.match(/^csrftoken=(.*)/i)[1];
        } else if (reSessionId.test(setCookieValue)) {
          sessionId = setCookieValue.match(/^sessionid=(.*)/i)[1];
        }
      default:
        // Do Nothing
    }
  }

  if (httpStatus && csrfToken && sessionId) {
    if (sessionHandler.setSession(httpStatus, csrfToken, sessionId)) {
      console.log("Login Succesful");
      sessionHandler.saveSession();
      console.log(sessionHandler.getSession());
      badgeManager.setBadge();
    }
  }
};

var logoutHandler = function(details) {
  let responseHeaders = details.responseHeaders;
  let httpStatus, sessionId;

  for (let i = 0; i < responseHeaders.length; i++) {
    let headerObj = responseHeaders[i];

    switch(headerObj.name) {
      case "status":
        let statusCode = (headerObj.value).toString();
        if (statusCode.match(/20\d/) != null) {
          httpStatus = statusCode;
        }
      case "set-cookie":
        let setCookieValue = headerObj.value;
        let reSessionId = /sessionid=/;
        if (reSessionId.test(setCookieValue)) {
          sessionId = setCookieValue.match(/^sessionid=(.*)/i)[1];
        }
      default:
        // Do Nothing
    }
  }
  
  if (httpStatus) {
    let sessionCookie = sessionId.split(";");
    if (sessionCookie[0] == "") {
      console.log("Logout successful");
      sessionHandler.clearSession();
      badgeManager.removeBadge();
    }
  }
};

// Update Session Info if it is different from the loaded one. This shouldn't block request timing. 
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) { 
    let headers = details.requestHeaders;
    let csrfTokenFromRequest = "";
    let sessionIdFromRequest = "";

    for (let i=0; i < headers.length; i++) {
      let name = headers[i].name.toLowerCase().trim();
      let value = headers[i].value.trim();

      switch(name) {
        case "x-csrftoken":
          csrfTokenFromRequest = value;
        case "cookie":
          let reSessionId = /sessionid=/;
          if (reSessionId.test(value)) {
            let valueList = value.split(";");
            for (let i=0; i < valueList.length; i++) {
              let eachValue = valueList[i].trim();
              if (reSessionId.test(eachValue)) {
                sessionIdFromRequest = eachValue.match(/^sessionid=(.*)/i)[1];
              }
            }
          }
        default:
          // Do Nothing
      }
    }
    if (!_.isEmpty(csrfTokenFromRequest) && !_.isEmpty(sessionIdFromRequest)) {
      if (sessionHandler.updateIfDifferent(csrfTokenFromRequest, sessionIdFromRequest)) {
        badgeManager.setBadge();
      };
    }
  },
  {
    urls: [
      "https://app.mopub.com/*",
      "https://app.mopub.com/"
    ]
  }, 
  ["requestHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(loginHandler, 
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


// Listen to update requests and add Referer / CSRF token header
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
      "https://app.mopub.com/web-client/api/line-items/update*"
    ]
  },
  ["requestHeaders", "extraHeaders", "blocking"]
);


// Storage Init ------------------------------------------------------
var initSession = function() {
  console.log("Initializing Session");
  sessionHandler.loadSession().then(function(result) {
    console.log("Session Loaded");
    console.log(sessionHandler.getSession());
    badgeManager.setBadge();
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
}

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
