var adSourceManager = (function(global) {
	"use strict";

	function convertToLineItem(adSources) {
		let convertedLineItems = [];

		for (let i=0; i < adSources.length; i++) {
			let lineItem = adSources[i];

			// Create OrderName
			lineItem.orderName = lineItem.secondaryName;

			// Update field names for Geo Targeting
			if ("regions" in lineItem) {
				lineItem.targetedRegions = lineItem.regions;
				delete lineItem.regions;
			}

			if ("cities" in lineItem) {
				lineItem.targetedCities = lineItem.cities;
				delete lineItem.cities;
			}

			if ("zipCodes" in lineItem) {
				lineItem.targetedZipCodes = lineItem.zipCodes;
				delete lineItem.zipCodes;
			}

			if ("countries" in lineItem) {
				lineItem.targetedCountries = lineItem.countries;
				delete lineItem.countries;
			}

			// Remove fields that doesn't exist in Lineitem type.
			delete lineItem.secondaryName;
			delete lineItem.pacing;
			delete lineItem.percentDelivered;

			// Empty overrideFields can have 3 different forms.
			// 1) {network_account_id: "", network_adunit_id: "", network_app_id: ""}
			// 2) undefined
			// 3) {}
			// adsource api returns {} or undefined
			// lineitem get api {network_account_id: "", network_adunit_id: "", network_app_id: ""}
			// get order api {network_account_id: "", network_adunit_id: "", network_app_id: ""}
			// all should be treated as same. unified form is {}
			
			if (lineItem.overrideFields == undefined || lineItem.overrideFields == null || _.isEmpty(clearEmpties(lineItem.overrideFields))) {
				lineItem.overrideFields = {};
			}

			convertedLineItems.push(lineItem);
		}

		return convertedLineItems;
	}
 
  return {
		convertToLineItem: convertToLineItem
  }
})(this);
