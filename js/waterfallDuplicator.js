var waterfallDuplicator = (function(global) {
  "use strict";

	function getOrderInfoForLineItems(lineItemKeys, callback) {
		let numberOfRemainingLineItems = lineItemKeys.length;
		let lineItems = [];
		let forEachResponse = function(lineItem) {
			if (lineItem) lineItems.push(lineItem);
			numberOfRemainingLineItems--;
			$(".updating-message").html(`Preparing.. remaining ${numberOfRemainingLineItems}`);
			if (numberOfRemainingLineItems == 0) callback(lineItems);
		}

		// Show loaders
		$(".updating-message").html(`Preparing.. remaining ${numberOfRemainingLineItems}`);
		$(".all-content-wrapper").dimmer("show");

		for (let i=0; i < lineItemKeys.length; i++) {
			lineItemManager.getLineItemFromMoPub(lineItemKeys[i], forEachResponse);
		}
	}

	function prepareChangeWithOneNewOrder(lineItemChanges, callback) {
		let afterCreateOrder = function(newOrder) {
			if ("key" in newOrder) {
				for (let lineItemKey in lineItemChanges) {
					lineItemChanges[lineItemKey].updatedFields.orderKey = newOrder.key;
				}
				callback(lineItemChanges);
			} else {
				callback();
			}
		}
		let newOrderName = "New Order" + " " + getCurrentDatetimeUTC();
		orderManager.createNewOrder(newOrderName, afterCreateOrder);
	}

	function prepareChangeWithNewOrders(lineItemChanges, callback) {
		let orderKeyAndLineItemKeys = {};

		// Create Mapping Order Key <--> LineItem Keys
		// { orderKey: {orderName, lineItemKeyList} }
		for (let lineItemKey in lineItemChanges) {
			let eachOrderKey = lineItemChanges[lineItemKey].updatedFields.orderKey;
			let eachOrderName = lineItemChanges[lineItemKey].updatedFields.orderName;
			if (orderKeyAndLineItemKeys[eachOrderKey] == undefined) {
				orderKeyAndLineItemKeys[eachOrderKey] = {
					orderName: eachOrderName, 
					lineItemKeys: [lineItemKey]
				};
			} else {
				orderKeyAndLineItemKeys[eachOrderKey].lineItemKeys.push(lineItemKey);
			}
		}

		// Create new order == same number of unique order keys 
		let numberOfOrdersToCreate = _.keys(orderKeyAndLineItemKeys).length;

		// Temp
		console.log("Order <-> lineitem mapping");
		console.log(orderKeyAndLineItemKeys);

		let afterCreateOrder = function(newOrder, oldOrderKey) {
			numberOfOrdersToCreate--;
			if ("key" in newOrder && oldOrderKey != null) {
				let lineItemKeys = orderKeyAndLineItemKeys[oldOrderKey].lineItemKeys;				
				// Update with new order key!
				for (let i=0; i < lineItemKeys.length; i++) {
					lineItemChanges[lineItemKeys[i]].updatedFields.orderKey = newOrder.key;
				}
			} else {
				// There was something wrong with creating some orders, return empty.
				callback();
			}
			// All LineItemChanges were updated with new order keys!
			if (numberOfOrdersToCreate == 0) {
				callback(lineItemChanges);	
			}
		}
		
		for (let eachOrderKey in orderKeyAndLineItemKeys) {
			let newOrderName = orderKeyAndLineItemKeys[eachOrderKey].orderName + " " + getCurrentDatetimeUTC();
			orderManager.createNewOrder(newOrderName, afterCreateOrder, eachOrderKey);
		}
	}

	function duplicate(TargetAdUnitIds, lineItems, option, selectedOrderInfo, postDuplicate) {
		let lineItemChanges = {};
		let lineItemsKeysNeedOrderKey = [];
		
		for (let i=0; i < lineItems.length; i++) {
			let each = lineItems[i];

			// Do not copy Marketplace Tab and advanced bidding items. Remove from the list, do not put in the changes.
			if (each.type == "marketplace" 
          || each.type == "advanced_bidding_mpx" 
          || each.type == "advanced_bidding_network" 
          || each.type == "pmp_line_item"
          || each.type == "segment") {
        continue;
      }

			// Assign Adunit Keys, (this will gets overrided but just in case)
			each["adUnitKeys"] = TargetAdUnitIds;

			lineItemChanges[each.key] = {
				action: "new",
				type: each.type,
				networkType: each.networkType,
				lineItemName : each.name + LineItemNameSuffix,
				updatedFields: each
			}

			// If order key doesn't exist, find the current order key
			// [Update 4/26] Get line item information for all items
			// if (!("orderKey" in each)) {
			lineItemsKeysNeedOrderKey.push(each.key);
			// }
		}

		console.log("Will duplicate following line items (changes)");
		console.log(lineItemChanges);

		let whenOrderInfoIsReady = function(lineItems) {
			for (let i=0; i < lineItems.length; i++) {
				let change = lineItemChanges[lineItems[i].key];

				// [Update 4/26] Instead of copying just order info, put entire line item info.
				// Except for ad unit key. It should be target ad unit key
				change.updatedFields = lineItems[i];
				change.updatedFields["adUnitKeys"] = TargetAdUnitIds;
				change.updatedFields["name"] += LineItemNameSuffix;
			}

			switch (option) {
				case "in_same_order":
					console.log("Creating lineitems in the same order");
					moPubUI.updateWaterfall(lineItemChanges, postDuplicate);
					break;
				case "in_one_new_order":
					console.log("Creating lineitems in one new order");
					prepareChangeWithOneNewOrder(lineItemChanges, function(updatedLineItemChanges) {
						if (updatedLineItemChanges) {
							moPubUI.updateWaterfall(updatedLineItemChanges, postDuplicate);
						} else {
							console.log("Error creating new order");
						}
					});
					break;
				case "in_one_existing_order":
					// Go through change objects and override orderKey and orderName (name will be removed in mopubUI since it is "new")
					for (let i=0; i < lineItems.length; i++) {
						let change = lineItemChanges[lineItems[i].key];
						change.updatedFields["orderKey"] = selectedOrderInfo.orderKey;
						change.updatedFields["orderName"] = selectedOrderInfo.orderName;
					}
					console.log(`Creating line items in existing order ${selectedOrderInfo.orderName} - ${selectedOrderInfo.orderKey}`);
					moPubUI.updateWaterfall(lineItemChanges, postDuplicate);
					break;
				case "in_new_order_with_neighbour":
					console.log("Creating lineitems in new order with neighbours");
					prepareChangeWithNewOrders(lineItemChanges, function(updatedLineItemChanges) {
						if (updatedLineItemChanges) {
							moPubUI.updateWaterfall(updatedLineItemChanges, postDuplicate);
						} else {
							console.log("Error creating some orders");
						}
					});
					break;
				default:
					break;
			}
		}

		// Run duplication only when there is target line items
		if (lineItemsKeysNeedOrderKey.length > 0) {
			// Get Order Key for changes
			getOrderInfoForLineItems(lineItemsKeysNeedOrderKey, whenOrderInfoIsReady);
		} else {
			// nothing to duplicate
			notifier.show({
				header: "No target line items to duplicate",
				type: "info",
				message: "Private Marketplace, Marketplace Tab (default MPX), Segment, Advanced Bidding line items will not be duplicated."
			});
		}
	}

  return {
		duplicate: duplicate
  }
})(this);
