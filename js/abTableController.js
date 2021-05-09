var abTableController = (function(global) {
  "use strict";

  function loadBidders(adUnitKey) {
    return new Promise(async (resolve, reject) => {

      let bidderList = [];

      try {
        const response = await moPubApi.getAbLineItemsByAdUnit(adUnitKey);
        const networkBidders = response.data.networks;
        const marketplace = response.data.marketplace;
        bidderList = networkBidders;
        bidderList.push({
          "enabled": marketplace.enabled,
          "networkType": "marketplace",
          "overrideFields": {
            "allowVideo": marketplace.allowVideo,
            "videoSetting": marketplace.videoSetting,
            "rewardedDisplayEnabled": marketplace.rewardedSettings.displayEnabled,
            "rewardedPlayableEnabled": marketplace.rewardedSettings.playableEnabled
          }
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