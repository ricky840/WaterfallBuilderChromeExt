var accountManager = (function(global) {
	"use strict";

	let userEmail;

	function loadAccountInfo() {
		return new Promise(async (resolve, reject) => { 
			try {
				const accountInfo = await moPubApi.getUsers();
				if (accountInfo.length > 0) {
					for (let i=0; i < accountInfo.length; i++) {
						if (accountInfo[i].isPrimary) {
							userEmail = accountInfo[i].email;
							updateHtmlEmail(userEmail);
							break;
						}
					}
					console.log(`Logged in user ${userEmail}`);
					resolve(userEmail);
				}		
			} catch (error) {
				console.log("Error while fetching user account");
				console.log(error);
				updateHtmlEmail("Unknown");
			}
		});
	}
	
	function updateHtmlEmail(email) {
		$("#logged-in-account").html(email);
	}

	function getUserEmail() {
		return userEmail;
	}
 
  return {
		loadAccountInfo: loadAccountInfo,
		updateHtmlEmail: updateHtmlEmail,
		getUserEmail: getUserEmail
  }
})(this);
