var orderManager = (function(global) {
  "use strict";

	// This stores line items under each order
	let orders = {};

	function isCached(orderKey) {
		return (orderKey in orders) ? true : false;
	}

	function cache(orderKey, responseText) {
		let orderObj = {};
		try {
			orderObj = JSON.parse(responseText);
		} catch(err) {
			console.log(err.message);
		}
		orders[orderKey] = orderObj;
	}

	function getOrders() {
		let orderList = [];
		for (let key in orders) {
			orderList.push(orders[key]);	
		}
		return orderList;
	}

	function removeCache() {
		orders = {};
		return true;
	}

	function createNewOrder(name, afterCreate, oldOrderKey = null) {
		let newOrderData = {
			name: name + OrderNameSuffix,
			advertiser: NEW_ORDER_ADVERTISER, 
			description: `${NEW_ORDER_DESC} ${getCurrentDatetimeUTC()} UTC`
		}

		let request = {
			url: BASE_URL + CREATE_ORDER,
			data: newOrderData,
			headers: { "Content-Type": "application/json; charset=utf-8" }
		};

		http.postRequest(request).then(function(result) {
			try {
				let newOrder = JSON.parse(result.responseText);
				console.log(`New Order ${newOrder.name} ${newOrder.key} created`);
				afterCreate(newOrder, oldOrderKey);
			} catch (error) {
				console.log(`New order create response is not in the right format. ${error.message}`);
				afterCreate();
			}
		}).catch(function(error) {
			console.log(`Failed to create new order - ${error}`);
			afterCreate();
		});
	}
 
  return {
		isCached: isCached,
		cache: cache,
		getOrders: getOrders,
		removeCache: removeCache,
		createNewOrder: createNewOrder
  }
})(this);
