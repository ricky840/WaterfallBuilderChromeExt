var sessionHandler = (function(global) {
  "use strict";

  let httpStatusCode = "000";
  let csrfToken = "";
  let sessionId = "";
  let lastUpdated = 0;

  function parseCookie(rawCookie) {
    // r4XPYpPcGbEqFdyTvtZnvTlUtNG4AJg3bB3of3Ljm7SZBGbnQLm5nmJjGJtFKtqJ; Max-Age=31449600; Expires=Fri, 25 Dec 2020 07:42:34 GMT; Path=/; Secure
    // ghj032o9zameu1pdp3ls0fcuw31ja4hb; Path=/; Secure; HTTPOnly
    let splittedCookie = rawCookie.split(";");
    return splittedCookie[0].trim();
  }

  function setSession(status, token, sid) {
    httpStatusCode = status;
    csrfToken = parseCookie(token); 
    sessionId = parseCookie(sid);
    lastUpdated = new Date().getTime();
    return true;
  }

  function saveSession() {
    let sessionData = {
      httpStatusCode: httpStatusCode,
      csrfToken: csrfToken,
      sessionId: sessionId,
      lastUpdated: lastUpdated
    };
    chrome.storage.local.set({ sessionInfo: sessionData }, function() {
      console.log("Session Saved");
    });
  }

  function loadSession() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get("sessionInfo", function(result) {
        let sessionData = result["sessionInfo"];
        httpStatusCode = sessionData.httpStatusCode;
        csrfToken = sessionData.csrfToken;
        sessionId = sessionData.sessionId;
        lastUpdated = sessionData.lastUpdated;
        resolve(sessionData);
      });
    });
  }

  function getSession() {
    return {
      statusCode: httpStatusCode,
      csrfToken: csrfToken,
      sessionId: sessionId,
      lastUpdated: lastUpdated
    }
  }

  function clearSession() {
    httpStatusCode = 0;
    csrfToken = "";
    sessionId = "";
    lastUpdated = 0;

    chrome.storage.local.set({ sessionInfo: {} }, function() {
      console.log("Session Cleared");
    });
    return true;
  }

  function updateIfDifferent(newCSRF, newSessionId) {
    if (!_.isEqual(csrfToken, newCSRF) || !_.isEqual(sessionId, newSessionId)) {
      setSession("204", newCSRF, newSessionId);
      saveSession();
      console.log("Updated Session Info");
      return true;
    } else {
      // console.log("Using Existing Session Info");
      return false;
    }
  }
 
  return {
    setSession: setSession,
    getSession: getSession,
    clearSession: clearSession,
    loadSession: loadSession,
    saveSession: saveSession,
    updateIfDifferent: updateIfDifferent
  }
})(this);