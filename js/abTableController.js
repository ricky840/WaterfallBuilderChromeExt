var abTableController = (function(global) {
  "use strict";

  function loadBidders(adUnitKey) {
    return new Promise(async (resolve, reject) => {

      let bidderList = [];

      try {
        const response = await moPubApi.getAbLineItemsByAdUnit(adUnitKey);
        const networkBidders = response.data.networks;
        const marketplace = response.data.marketplace;
        const priority = response.data.priority;
        bidderList = networkBidders;
        
        /**
         * marketplace's data keeps changing. So except for "enable" field
         * everything else should just be showing up in overridesField.
         */
        let overrideFieldsForMarketPlace = jQuery.extend(true, {}, marketplace);
        delete overrideFieldsForMarketPlace.enabled;

        bidderList.push({
          "enabled": marketplace.enabled,
          "networkType": "marketplace",
          "overrideFields": overrideFieldsForMarketPlace
        });

        // Add priority field for all bidders
        bidderList.forEach(bidder => {
          bidder.priority = priority; 
        });

      } catch (error) {
        // do nothing for now
        reject(error);
        return;
      }

      ABTable.blockRedraw();
      await ABTable.clearData();
      await ABTable.replaceData(bidderList); // replaceData will not fire any table events
      ABTable.restoreRedraw();

      resolve(bidderList);
      return;
    });
  }

  return {
		loadBidders: loadBidders
  }
})(this);