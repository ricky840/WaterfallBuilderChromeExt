var waterfallTableController = (function(global) {
  "use strict";

  function loadLineItems(adUnitKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const lineItemList = await moPubApi.getLineItemsByAdUnit(adUnitKey);
        WaterfallTable.blockRedraw();
        await WaterfallTable.replaceData(lineItemList); // replaceData will not fire any table events
        WaterfallTable.restoreRedraw();

        // Save line items in the store
        lineItemStore.initLineItemStore(lineItemList);

        resolve(lineItemList);
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  function resetSorting() {
    WaterfallTable.setSort([
      { column: "bid", dir:"desc" },
      { column: 'priority', dir:"asc" }
    ]);
  }

  return {
		loadLineItems: loadLineItems,
    resetSorting: resetSorting
  }
})(this);