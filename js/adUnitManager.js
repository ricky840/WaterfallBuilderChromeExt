var adUnitManager = (function(global) {
	"use strict";

	let adUnitList = [];
	let currentAdUnitKey = "";

	function dropDownFormatter(adUnits) {
		let formatted = [];
		for (let i=0; i < adUnits.length; i++) {
			let os = (adUnits[i].appType == "ios") ? "iOS" : "AOS";
			let ostag = (os == "iOS") ? "ios" : "aos";
			let appName = adUnits[i].appName.capitalize();
			let adUnitName = adUnits[i].name.capitalize();
			let format = adUnits[i].format.capitalize();
			let key = adUnits[i].key;
      let status = (adUnits[i].active == true) ? "unitstatusactive" : "unitstatusinactive";

			let value = `<${ostag}>${os}</${ostag}>`;
			value += `<unitformat>${format}</unitformat>`;
			value += `<unitname>${adUnitName}</unitname>`;
			value += `<appname>${appName}</appname>`;
			value += `<${status}></${status}>`;
			value += `<unitkey>(${key})</unitkey>`;

			formatted.push({
				name: value,
				value: key
			});
		}

		return formatted;
	}

	function dropDownFormatterWithoutFormat(adUnits) {
		let formatted = [];
		for (let i=0; i < adUnits.length; i++) {
			let os = (adUnits[i].appType == "ios") ? "iOS" : "AOS";
			let ostag = (os == "iOS") ? "ios" : "aos";
			let appName = adUnits[i].appName.capitalize();
			let adUnitName = adUnits[i].name.capitalize();
			let format = adUnits[i].format.capitalize();
			let key = adUnits[i].key;

			let value = `<${ostag}>${os}</${ostag}>`;
			value += `<unitformatnofloat>${format}</unitformatnofloat>`;
			value += `<unitname>${adUnitName}</unitname>`;
			value += `<appname>${appName}</appname>`;
			value += `<unitkey>(${key})</unitkey>`;

			formatted.push({
				name: value,
				value: key
			});
		}

		return formatted;
	}

	function loadAdUnits() {
		return new Promise(async function(resolve, reject) { 
			const adUnits = await moPubApi.getAdUnits();
			adUnitList = adUnits;
			resolve(adUnits);
		}).catch(function(error) {
			reject(error);
		});
	}

	function saveCurrentAdUnit(key) {
		currentAdUnitKey = key;
		console.log(`Selected Ad Unit Key: ${currentAdUnitKey}`);
		console.log(`Selected Ad Unit Name: ${getCurrentAdUnitName()}`);
	}

	function getCurrentAdUnit() {
		return getAdUnit(currentAdUnitKey);
	}

	function getCurrentAdUnitKey() {
		return currentAdUnitKey;
	}

	function getCurrentAdUnitName() {
		for (const adunit of adUnitList) {
			if (adunit.key == currentAdUnitKey) {
				return adunit.name;
			}
		}
	}

	function getAdUnitNameByKey(key) {
		for (const adunit of adUnitList) {
			if (adunit.key == key) {
				return adunit.name;
			}
		}
	}

	function getAdUnit(key) {
		for (const adunit of adUnitList) {
			if (adunit.key == key) {
				return adunit;
			}
		}
	}

  return {
		loadAdUnits: loadAdUnits,
		saveCurrentAdUnit: saveCurrentAdUnit,
		getCurrentAdUnit: getCurrentAdUnit,
		getCurrentAdUnitKey: getCurrentAdUnitKey,
		getCurrentAdUnitName: getCurrentAdUnitName,
		getAdUnitNameByKey: getAdUnitNameByKey,
		getAdUnit: getAdUnit,
		dropDownFormatter: dropDownFormatter,
		dropDownFormatterWithoutFormat: dropDownFormatterWithoutFormat
  }
})(this);
