var accountManager = (function(global) {
	"use strict";

	let userEmail;

	function fetchAccountInfo() {
		return new Promise(function(resolve, reject) { 
			let request = { url: BASE_URL + GET_ACCOUNT };
			http.getRequest(request).then(function(result) {
		  	let accountInfo = JSON.parse(result.responseText);
				if (accountInfo.length > 0) {
					for (let i=0; i < accountInfo.length; i++) {
						if (accountInfo[i].isPrimary) {
							userEmail = accountInfo[i].email;
							break;
						}
					}
					// Temp
					console.log(`Logged in user ${userEmail}`);
					resolve(userEmail);
				}		
			}).catch(function(error) {
				console.log("Error while fetching user account");
				reject();
			});
		});
	}
	
	function updateHtmlEmail(email) {
		fetchAccountInfo().then(function(userEmail) {
			let html = `${userEmail}<div class="logged-in-account-desc">(Showing primary in your account)</div>`;
			$("#logged-in-account").html(html);
		}).catch(function(error) {
			$("#logged-in-account").html("Unknown");
		});
	}

	function getUserEmail() {
		return userEmail;
	}
 
  return {
		fetchAccountInfo: fetchAccountInfo,
		updateHtmlEmail: updateHtmlEmail,
		getUserEmail: getUserEmail
  }
})(this);
