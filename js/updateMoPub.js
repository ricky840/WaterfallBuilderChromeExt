var updateMoPub = (function(global) {
  'use strict';

  function adUnitWaterfall() {
    let changes = lineItemCacher.getLineItemChanges();

		console.log(changes)
		// return false;

    for (let lineItemKey in changes) {
      let type = changes[lineItemKey].type;
      let networkType = changes[lineItemKey].networkType;
      let updatedFields = changes[lineItemKey].updatedFields;
      
      // Default update lineitem API
      let endPoint = `${UPDATE_LINEITEM}?key=${lineItemKey}`;

      // Default Marketplace should use AdSource update endpoint.
      // Only change it should accept is "cpm" and "enabled" field.
      if (networkType == "marketplace") {
        endPoint = `${UPDATE_ADSOURCE}?key=${lineItemKey}&type=marketplace`;
        if ("bid" in updatedFields) {
          updatedFields.cpm = updatedFields.bid;
          delete updatedFields.bid;
        }
      }

      let url = BASE_URL + endPoint;
      let headers = {
        "Content-Type": "application/json; charset=utf-8"
      }
      let request = {
        url: url,
        data: updatedFields,
        headers: headers
      };

      http.postRequest(request).then(function(result) {
        console.log(result);
        // lineItemCacher.delete();
        $("#load-waterfall").trigger('click'); // Supply adunit later here
        // [To-do] Notification 띄울 것
      }).catch(function(error) {
        console.log(error);
        // [To-do] Notification 띄울 것
      });
    }
  }

  return {
    adUnitWaterfall: adUnitWaterfall
  }
})(this);
