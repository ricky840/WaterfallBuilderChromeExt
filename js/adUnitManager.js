var adUnitManager = (function(global) {
	"use strict";

	let originalResponse = {};

	function listFormat(adUnits) {
		let formatted = [];
		for (let i=0; i < adUnits.length; i++) {
			let os = (adUnits[i].appType == "iphone") ? "iOS" : "AOS";
			let ostag = (os == "iOS") ? "ios" : "aos";
			let appName = adUnits[i].appName.capitalize();
			let adUnitName = adUnits[i].name.capitalize();
			let format = adUnits[i].format.capitalize();
			let key = adUnits[i].key;
			let value = `<${ostag}>${os}</${ostag}><unitformat>${format}</unitformat><unitname>${adUnitName}</unitname><appname>${appName}</appname><unitkey>(${key})</unitkey>`;
			let searchBy = `${os} ${appName} ${adUnitName} ${format} ${key}`;
			formatted.push({
				value: value,
				searchBy: searchBy
			});
		}
		return formatted;
	}

	// formatOption = list-name-id | raw
	function loadAdUnits(formatOption, callback) {

		// Load from cache if exists
		if (!_.isEmpty(originalResponse)) {
			console.log("Loading ad units from cache");
			(formatOption == "list-name-id") ? callback(listFormat(originalResponse)) : callback(originalResponse);
		} else {
			let url = BASE_URL + GET_ADUNITS;
			let request = { url: url };

			console.log("Loading ad units from MoPub");
			http.getRequest(request).then(function(result) {
				let adUnits = JSON.parse(result.responseText);
				originalResponse = adUnits;
				console.log("Ad units were loaded");
				(formatOption == "list-name-id") ? callback(listFormat(adUnits)) : callback(adUnits);
			}).catch(function(error) {
				callback([]);
				notifier.show({
					header:	"Error loading ad units",
					message: `Please login to MoPub UI. If you keep seeing this error, try to refresh this page or logout and login in MoPub UI. ${error.responseText}`,
					type: "negative"
				});
				console.log(error);
			});
		}
	}

  return {
		loadAdUnits: loadAdUnits
  }
})(this);
