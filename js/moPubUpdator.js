var moPubUpdator = (function(global) {
	"use strict";

  function createPostDataForNewLineItem(change) {
    // For a new line item, running is a default status. Don't need to specify.
    delete change.status; 

    /**
     * Remove fields that are not allowed in CREATE
     */
    delete change.key;
    delete change.orderName;
    delete change.dayParts;
    delete change.dayPartTargeting;
    delete change.deviceTargeting;
    delete change.maxAndroidVersion;
    delete change.minAndroidVersion;
    delete change.maxIosVersion;
    delete change.minIosVersion;
    delete change.targetAndroid;
    delete change.targetIos;
    delete change.targetIphone;
    delete change.targetIpad;
    delete change.targetIpod;
    delete change.includeConnectivityTargeting;
    delete change.targetedCarriers;
    delete change.targetedRegions;
    delete change.targetedCities;
    delete change.targetedZipCodes;
    delete change.userAppsTargeting;
    delete change.userAppsTargetingList;
    delete change.advertiser;
    delete change.allocationPercentage;
    delete change.refreshInterval;
    delete change.frequencyCaps;

    // Start new line item always
    change.startImmediately = true;

    // If overrideFields exists, turn on enableOverrides
    if ("overrideFields" in change) change.enableOverrides = true;

    return change;
  }

  function createPutDataForUpdatedLineItem(change) {
    /**
     * We don't have to specify all fields that needs to be removed.
     * Since fields that can be updated is already limited.
     * All fields that were updated are should already be allowed.
     */

    // Key was added to pass the line item key to create the API end point.
    // This wasn't from the change object originally.
    delete change.key; 
    
    // If overrideFields exists, turn on enableOverrides
    if ("overrideFields" in change) change.enableOverrides = true;

    // Status uses enabled + archived instead
    if ("status" in change) {
      const status = change.status;
      switch(status) {
        case "running":
          change.enabled = true;
          change.archived = false;
          delete change.status;
          break;
        case "paused":
          change.enabled = false;
          change.archived = false;
          delete change.status;
          break;
        case "archived":
          change.enabled = false;
          change.archived = true;
          delete change.status;
          break;
        case "unarchived":
          change.enabled = true;
          change.archived = false;
          delete change.status;
          break;
        default:
          // Should be one of above if not, don't update status.
          delete change.status;
      }
    }

    return change;
  }

  function applyToMoPub() {
    return new Promise((resolve, reject) => {
      const lineItems = lineItemStore.getChangedLineItems();
      let changesForNewLineItems = [];
      let changesForUpdateLineItems = [];

      lineItems.forEach((lineItem) => {
        if (lineItem.isNewlyCreated()) { 
          // New Line Item
          changesForNewLineItems.push(lineItem.getChanges());
        } else {
          // Updated Line Item, remove "org" values. Create "changes" object with newValues only.
          const changes = lineItem.getChanges();
          let changesWithOutOrgValue = {};
          for (const field in changes) {
            changesWithOutOrgValue[field] = changes[field].newValue;
          }
          changesWithOutOrgValue.key = lineItem.getKey(); // This will be used when generating the api end point
          changesForUpdateLineItems.push(changesWithOutOrgValue) ;
        }
      });

      // Promises
      let promiseTasks = [];
      let delayMilSec = 0;

      changesForNewLineItems.forEach((eachChange) => {
        const lineItemKey = eachChange.key;
        const postData = createPostDataForNewLineItem(eachChange);

        /**
         * For direct serve line items (gtee, non_gtee, promo, backfill_promo)
         * User internal API to create them. Current public API doesn't support direct serve items.
         * "Change" object will include "type" field
         */ 
        const directServeItems = ["gtee", "non_gtee", "promo", "backfill_promo"];
        if (directServeItems.includes(eachChange.type)) {
          promiseTasks.push(moPubApi.createNewLineItemViaOldApi(postData, lineItemKey, delayMilSec));
        } else {
          promiseTasks.push(moPubApi.createNewLineItem(postData, lineItemKey, delayMilSec));
        }

        delayMilSec += DELAY_INCREMENT;
      });

      changesForUpdateLineItems.forEach((eachChange) => {
        const lineItemKey = eachChange.key;
        const putData = createPutDataForUpdatedLineItem(eachChange);
        promiseTasks.push(moPubApi.updateLineItem(putData, lineItemKey, delayMilSec));
        delayMilSec += DELAY_INCREMENT;
      });

      // Set progress bar total
      progressBar.setTotal(promiseTasks.length, "Applying..");

      Promise.allSettled(promiseTasks).then((results) => {
        resolve(results);
        progressBar.reset();
      });
    });
  }

  return {
    applyToMoPub: applyToMoPub,
    createPostDataForNewLineItem: createPostDataForNewLineItem,
    createPutDataForUpdatedLineItem: createPutDataForUpdatedLineItem
  }
})(this);
