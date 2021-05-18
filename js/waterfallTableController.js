var waterfallTableController = (function(global) {
  "use strict";

  function loadLineItems(adUnitKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const lineItemList = await moPubApi.getLineItemsByAdUnit(adUnitKey);
        const lineItemListWithoutTestModeItems = filterTestModeLineItems(lineItemList); // Temp

        WaterfallTable.blockRedraw();
        await WaterfallTable.replaceData(lineItemListWithoutTestModeItems); // replaceData will not fire any table events
        WaterfallTable.restoreRedraw();

        // Save line items in the store
        lineItemStore.initLineItemStore(lineItemListWithoutTestModeItems);

        resolve(lineItemListWithoutTestModeItems);
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  /**
   *  This is temporary. API returns SDK Test Mode line items. It will be updated in the future
   */
  function filterTestModeLineItems(allLineItems) {
    const result = allLineItems.filter(lineItem => {
      return (lineItem.advertiser != "SDK Test Mode" && lineItem.orderName != "SDK Test Mode");
    });
    return result;
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