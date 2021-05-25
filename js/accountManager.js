var accountManager = (function(global) {
	"use strict";

	function loadAccountInfo() {
		return new Promise(async (resolve, reject) => { 
			try {
				const accountInfo = await moPubApi.getAccount();
				updateHtmlAccount(accountInfo);
				resolve();
			} catch (error) {
				console.log("Error while loading account info");
				console.log(error);
				reject();
			}
		});
	}

	function loadUserInfo() {
		return new Promise(async (resolve, reject) => { 
			try {
				const userList = await moPubApi.getUsers();
				if (userList.length > 0) {
					for (let i=0; i < userList.length; i++) {
						if (userList[i].isPrimary) {
							console.log(`Logged in user ${userList[i].email}`);
							updateHtmlEmail(userList[i]);
							break;
						}
					}
					resolve();
				}		
			} catch (error) {
				console.log("Error while fetching user account");
				console.log(error);
				reject(error);
			}
		});
	}
	
	function updateHtmlEmail(user) {
		$("#info-primary-email").html(user.email);
		$("#info-primary-permission").html(user.permission.toUpperCase());
	}

	function updateHtmlAccount(accountInfo) {
		const company = `
			<a href="${ACCOUNT_URL}" target="_blank" style="color: white;">
				${accountInfo.company.toUpperCase()}
			</a>`;
		$("#info-company").html(company);
		$("#info-lineitem-limit").html(accountInfo.limits.lineItem);
	}

	function getUserEmail() {
		return userEmail;
	}
 
  return {
		loadUserInfo: loadUserInfo,
		loadAccountInfo: loadAccountInfo,
		updateHtmlEmail: updateHtmlEmail,
		getUserEmail: getUserEmail
  }
})(this);
