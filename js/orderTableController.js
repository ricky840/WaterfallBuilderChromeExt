var orderTableController = (function(global) {
  "use strict";

  function loadOrders() {
    return new Promise(async (resolve, reject) => {
      try {
        const orderList = await moPubApi.getOrders();
        await OrderTable.replaceData(orderList);
        resolve(orderList);
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  function getOrderByKey(key) {
    const rows = OrderTable.searchRows("key", "=", key);
    return (rows.length == 1) ? rows[0].getData() : false;
  }

  return {
		loadOrders: loadOrders,
    getOrderByKey: getOrderByKey
  }
})(this);