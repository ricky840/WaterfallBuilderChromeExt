var lineItemManager = (function(global) {
	"use strict";
	
	let orgLineItems = {};

	function getLineItemFromMoPub(key, callback) {
		let request = { url: BASE_URL + GET_LINEITEM + "?key=" + key };
		http.getRequest(request).then(function(result) {
			let lineItem = JSON.parse(result.responseText);
			callback(lineItem);
		}).catch(function(error) {
			console.log(`Failed to load lineitem ${key} - ${error}`);
			callback();
		});
	}

	function cacheLineItem(dataList) {
		for(let i=0; i < dataList.length; i++) {
			try {
				// Clean up overrideFields before saving in order to make the change accurate
				dataList[i].overrideFields = clearEmpties(dataList[i].overrideFields); 
				orgLineItems[dataList[i].key] = JSON.parse(JSON.stringify(dataList[i]));
				console.log(`Original LineItem Cache Updated`);
			} catch(err) {
				console.log(err.message);
			}
		}
	}

	// This is not being used
	function cacheLineItemByOrder(orderResponseText) {
		let orderObj = {};
		try {
			orderObj = JSON.parse(orderResponseText);
			let list = orderObj.lineItems;
			for (let i=0; i < list.length; i++) {
				// Clean up overrideFields before saving in order to make the change accurate
				list[i].overrideFields = clearEmpties(list[i].overrideFields);
				let lineItemKey = list[i].key;
				orgLineItems[lineItemKey] = list[i];
				console.log(`Original LineItem Cache Updated`);
			}
		} catch(err) {
			console.log(err.message);
		}
	}

	function getLineItemChanges() {
		let currentLineItemList = WaterfallTable.getData();
		let lineItemChanges = {};

    // Find changes based on the current lineitems in the table
		for (let i=0; i < currentLineItemList.length; i++) {
			let eachLineItem = currentLineItemList[i];
			let lineItemKey = eachLineItem.key;
			let type = eachLineItem.type
		 	let networkType = eachLineItem.networkType;
			let lineItemName = eachLineItem.name;

			// Find updates for existing lineitems
			if (lineItemKey in orgLineItems) {
				let orgLineItem = orgLineItems[lineItemKey];

				// Based on current lineitem, compare each field
				for (let fieldKey in eachLineItem) {
					if (!_.isEqual(orgLineItem[fieldKey], eachLineItem[fieldKey])) {
						// Save Changes
						if (lineItemKey in lineItemChanges) {
							let changeObj = lineItemChanges[lineItemKey];
							changeObj.updatedFields[fieldKey] = eachLineItem[fieldKey];
						} else {
							lineItemChanges[lineItemKey] = {
								action: "update",
								type: type,
								networkType: networkType,
								lineItemName : lineItemName,
								updatedFields: { [fieldKey]: eachLineItem[fieldKey] }
							}
						}
					}
				}
			} else {
				// if the lineitem key does not exist in orgLineItems, this is new line item.
				lineItemChanges[lineItemKey] = {
					action: "new",
					type: type,
					networkType: networkType,
					lineItemName : lineItemName,
					updatedFields: eachLineItem
				}
			}
		}
		
		// Find deleted line items (deassigned)
		for (let orgKey in orgLineItems) {
			let deleted = true;
			for (let i=0; i < currentLineItemList.length; i++) {
				// See if key from orgLineItems exists in currentLineItemList. If it doesn't then it was removed.
				if (orgKey == currentLineItemList[i].key) {
					deleted = false;
					break;
				}
			}
			if (deleted) {
				// line item was removed! remove the key from adUnitKeys and update.
				if (orgLineItems[orgKey].adUnitKeys) {
					let removedAdUnitKeys = _.without(orgLineItems[orgKey].adUnitKeys, AdUnitId);
					lineItemChanges[orgKey] = {
						action: "delete (deassigned)",
						type: orgLineItems[orgKey].type,
						networkType: orgLineItems[orgKey].networkType,
						lineItemName : orgLineItems[orgKey].name,
						updatedFields: { adUnitKeys: removedAdUnitKeys }
					}
				}
			}
		}

		return lineItemChanges;
	}

	function removeCache() {
		orgLineItems = {};
		return true;
	}

	function getOrgLineItems() {
		return orgLineItems;
	}
 
  return {
		cacheLineItem: cacheLineItem,
		cacheLineItemByOrder: cacheLineItemByOrder,
		getLineItemChanges : getLineItemChanges,
		removeCache: removeCache,
		getOrgLineItems: getOrgLineItems,
		getLineItemFromMoPub: getLineItemFromMoPub
  }
})(this);
