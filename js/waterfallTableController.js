var waterfallTableController = (function(global) {
  "use strict";

  let currentAdUnitKey = "";

  function loadLineItems(adUnitKey) {
    return new Promise(async (resolve, reject) => {
      const lineItemList = await moPubApi.getLineItems(adUnitKey);

      WaterfallTable.blockRedraw();
      WaterfallTable.clearData();
      await WaterfallTable.replaceData(lineItemList);
      WaterfallTable.restoreRedraw();

      currentAdUnitKey = adUnitKey;
      lineItemStore.initLineItemStore(lineItemList);

      // [To-do] Init control buttons here

      resolve(lineItemList);
      return;
    });
  }

  function getCurrentAdUnitKey() {
    return currentAdUnitKey;
  }

  return {
		loadLineItems: loadLineItems,
    getCurrentAdUnitKey: getCurrentAdUnitKey
  }
})(this);