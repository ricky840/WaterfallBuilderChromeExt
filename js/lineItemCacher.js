var lineItemCacher = (function(global) {
	"use strict";
	
	let orgLineItems = {};

	function cacheAdSource(dataList) {
		for(let i=0; i < dataList.length; i++) {
			try {
				orgLineItems[dataList[i].key] = JSON.parse(JSON.stringify(dataList[i]));
			} catch(err) {
				console.log(err.message);
			}
		}
	}

	function cacheLineItem(orderResponseText) {
		let orderObj = {};
		try {
			orderObj = JSON.parse(orderResponseText);
		} catch(err) {
			console.log(err.message);
		}
		let list = orderObj.lineItems;
		for (let i=0; i < list.length; i++) {
			let lineItemKey = list[i].key;
			orgLineItems[lineItemKey] = list[i];
		}
	}
	
	function findLineItemChanges() {
		let data = WaterfallTable.getData();
		let	lineItemChanges = {};

		for (let i=0; i < data.length; i++) {
			let eachLineItem = data[i];
			let lineItemKey = eachLineItem.key;
			let orgLineItem = orgLineItems[lineItemKey];
			let type = ("adUnitKeys" in eachLineItem) ? "LineItem" : "AdSource";
			let networkType = eachLineItem.type;

			for (let colKey in eachLineItem) {
				// Compare each field.
				if (!_.isEqual(orgLineItem[colKey], eachLineItem[colKey])) {
					// Save Changes
					if (lineItemKey in lineItemChanges) {
						let changeObj = lineItemChanges[lineItemKey];
						changeObj.type = type;
						changeObj.networkType = networkType;
						changeObj.updatedFields[colKey] = eachLineItem[colKey];
					} else {
						lineItemChanges[lineItemKey] = {
							type: type,
							networkType: networkType,
							updatedFields: { [colKey]: eachLineItem[colKey] }
						}
					}
				}
			}
		}
		return lineItemChanges;
	}

  // Convert Adsource type to lineitem to use lineitem update API
	function adSourceToLineItemMapping(changes) {
		for (let lineItemKey in changes) {
			let eachChange = changes[lineItemKey];
			let networkType = changes[lineItemKey].networkType;
			let updatedFields = eachChange.updatedFields;

			// Remove fields doesn't eixst in Lineitem type.
			delete updatedFields.secondaryName;
			delete updatedFields.pacing;
			delete updatedFields.percentDelivered;

			// Update field names for Geo Targeting
			if ("regions" in updatedFields) {
				updatedFields.targetedRegions = updatedFields.regions;
				delete updatedFields.regions;
			} 
			if ("cities" in updatedFields) {
				updatedFields.targetedCities = updatedFields.cities;
				delete updatedFields.cities;
			}
			if ("zipCodes" in updatedFields) {
				updatedFields.targetedZipCodes = updatedFields.zipCodes;
				delete updatedFields.zipCodes;
			}
			if ("countries" in updatedFields) {
				updatedFields.targetedCountries = updatedFields.countries;
				delete updatedFields.countries;
			}

			// "status" field should be replaced with "enabled" field name
			if ("status" in updatedFields) {
				let value = updatedFields.status;
				switch(value) {
					case "running":
						updatedFields.enabled = true;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					case "paused":
						updatedFields.enabled = false;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					case "archived":
						updatedFields.enabled = false;
						updatedFields.archived = true;
						delete updatedFields.status;
						break;
					case "unarchived":
						updatedFields.enabled = true;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					default:
						// Should be one of above if not, don't update status.
						delete updatedFields.status;
				}
			}

      // For marketplace, status field should be replaced with enabled only.
			// It doesn't use archived field.
			if (networkType == "marketplace") {
				delete updatedFields.archived;
			}

			// [To-do] If OverrideFields exist, update enableOverrides
		

			// Remove Lineitem that has empty updatedFields - no need to make update API
			if (_.isEmpty(updatedFields)) {
				delete changes.lineItemKey;
			}
		}

		return changes;
	}

	function getLineItemChanges() {
		let changes = findLineItemChanges();
		return adSourceToLineItemMapping(changes);
	}

	function removeCache() {
		orgLineItems = {};
		return true;
	}
 
  return {
		cacheAdSource: cacheAdSource,
		cacheLineItem: cacheLineItem,
		getLineItemChanges : getLineItemChanges,
		delete: removeCache
  }
})(this);
