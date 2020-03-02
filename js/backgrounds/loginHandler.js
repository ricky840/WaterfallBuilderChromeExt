var loginHandler = (function(global) {
  "use strict";

	let preLoginEmail;

	function setPreLoginEmail(emailAddr) {
		preLoginEmail = emailAddr;	
	}

	function parseSetCookie(rawCookie) {
    // r4XPYpPcGbEqFdyTvtZnvTlUtNG4AJg3bB3of3Ljm7SZBGbnQLm5nmJjGJtFKtqJ; Max-Age=31449600; Expires=Fri, 25 Dec 2020 07:42:34 GMT; Path=/; Secure
    // ghj032o9zameu1pdp3ls0fcuw31ja4hb; Path=/; Secure; HTTPOnly
    let splittedCookie = rawCookie.split(";");
    return splittedCookie[0].trim();
  }

	function processLoginResult(details) {
		let responseHeaders = details.responseHeaders;
		let httpStatus, csrfToken, sessionId;

		for (let i = 0; i < responseHeaders.length; i++) {
			let headerObj = responseHeaders[i];

			switch(headerObj.name) {
				case "status":
					let statusCode = (headerObj.value).toString();
					if (statusCode.match(/204/) != null) {
						httpStatus = statusCode;
					}
				case "set-cookie":
					let setCookieValue = headerObj.value;
					let reToken = /csrftoken=/;
					let reSessionId = /sessionid=/;
					if (reToken.test(setCookieValue)) {
						csrfToken = parseSetCookie(setCookieValue.match(/^csrftoken=(.*)/i)[1]);
					} else if (reSessionId.test(setCookieValue)) {
						sessionId = parseSetCookie(setCookieValue.match(/^sessionid=(.*)/i)[1]);
					}
				default:
					// Do Nothing
			}
		}

		if (httpStatus && csrfToken && sessionId) {
			// If login was successful.
			let sessionData = {
				csrfToken: csrfToken,
				sessionId: sessionId,
				accountEmail: preLoginEmail
			}
			sessionHandler.saveSession(sessionData);
			console.log("Login Succesful");
		}
	}

	return {
		processLoginResult: processLoginResult,
		setPreLoginEmail: setPreLoginEmail
	}
})(this);
