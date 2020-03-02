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

			// If overrideFields is undefined, replace with {network_account_id: "", network_adunit_id: "", network_app_id: ""}
			// Which is what AdSource sends initially when there is no value! why? why not just undefined like lineitem fuck!
			if (lineItem.overrideFields == undefined) {
				lineItem.overrideFields = {network_account_id: "", network_adunit_id: "", network_app_id: ""};
			}

			convertedLineItems.push(lineItem);
		}

		return convertedLineItems;
	}
 
  return {
		convertToLineItem: convertToLineItem
  }
})(this);
