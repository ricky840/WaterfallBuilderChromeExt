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
				orgLineItems[dataList[i].key] = JSON.parse(JSON.stringify(dataList[i]));
				console.log(`Original LineItem Cache Updated`);
			} catch(err) {
				console.log(err.message);
			}
		}
	}

	function cacheLineItemByOrder(orderResponseText) {
		let orderObj = {};
		try {
			orderObj = JSON.parse(orderResponseText);
			let list = orderObj.lineItems;
			for (let i=0; i < list.length; i++) {
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

		// [To-do] Find lineitems that has been removed(deassigned) from the waterfall
		// This is for deassign lineitems. Let's do it later
		//
		// let deletedKeys = [];
		// for (let key in orgLineItems) {
		// 	let keyExist = false;
		// 	for (let i=0; i < currentLineItemList.length; i++) {
		// 		if(key == currentLineItemList[i].key) {
		// 			keyExist = true;
		// 		}
		// 	}
		// 	if (keyExist == false) {
		// 		let type = ("adUnitKeys" in orgLineItems[key]) ? "LineItem" : "AdSource";
		// 		let networkType = orgLineItems[key].type;
		// 		let adUnitKeyList = orgLineItems[key].
    //
		// 		_.pull(array, 'a', 'c');
    //
    //
		// 		lineItemChanges[key] = {
		// 			type: type,
		// 			networkType: networkType,
		// 			updatedFields: { adUnitKeys: eachLineItem[fieldKey] }
		// 		}
    //
    //
    //
		// 	}
		// }
		
		return lineItemChanges;
	}

	function removeCache() {
		orgLineItems = {};
		return true;
	}
 
  return {
		cacheLineItem: cacheLineItem,
		cacheLineItemByOrder: cacheLineItemByOrder,
		getLineItemChanges : getLineItemChanges,
		removeCache: removeCache,
		getLineItemFromMoPub: getLineItemFromMoPub
  }
})(this);
