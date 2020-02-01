var orderCacher = (function(global) {
  "use strict";

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
 
  return {
		isCached: isCached,
		cache: cache,
		getOrders: getOrders,
		delete: removeCache
  }
})(this);
