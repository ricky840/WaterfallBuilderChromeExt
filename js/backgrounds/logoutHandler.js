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
				// set-cookie: sessionid=; Max-Age=0; Expires=Mon, 2 Mar 2020 05:10:57 GMT; Path=/
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
			loginHandler.setPreLoginEmail();
      badgeManager.removeBadge();
    }
  }
};
