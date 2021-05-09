var lineItemTableController = (function(global) {
  "use strict";

async function loadLineItems(orderKeys) {
    return new Promise(async (resolve, reject) => {
      let results = [];

      try {
        results = await moPubApi.getLineItemsByOrders(orderKeys);
      } catch (error) {
        reject();
      }

      LineItemTable.clearData();
      LineItemTable.blockRedraw();
  
      let promises = [];
      results.forEach(result => {
        promises.push(LineItemTable.addData(result));
      });
  
      Promise.all(promises).then((results) => {
        LineItemTable.setFilter(LineItemTable.getFilters()); // Apply filter again!
        LineItemTable.setSort([{column: "orderName", dir: "desc"}]);
        LineItemTable.restoreRedraw();
        resolve();
      });

    });
  }

  return {
		loadLineItems: loadLineItems
  }
})(this);