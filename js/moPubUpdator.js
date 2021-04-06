var moPubUpdator = (function(global) {
	"use strict";

  function createPostDataForNewLineItem(change) {
    delete change.key;
    delete change.orderName;
    delete change.status; // For new, running is a default status. Don't need to specify.
    change.startImmediately = true;
    return change;
  }

  function createPutDataForUpdatedLineItem(change) {
    delete change.key;
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
    const putData = {
      op: "set",
      data: change
    };
    return putData;
  }

  function applyToMoPub() {
    return new Promise((resolve, reject) => {
      const lineItems = lineItemStore.getChangedLineItems();
      let changesForNewLineItems = [];
      let changesForUpdateLineItems = [];

      lineItems.forEach((lineItem) => {
        if (lineItem.isNewlyCreated()) { 
          // New Line Item
          changesForNewLineItems.push(lineItem.getChanges()) ;
        } else {
          // Updated Line Item
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

      changesForNewLineItems.forEach((eachChange) => {
        const postData = createPostDataForNewLineItem(eachChange);
        promiseTasks.push(moPubApi.createNewLineItem(postData));
      });

      changesForUpdateLineItems.forEach((eachChange) => {
        const lineItemKey = eachChange.key;
        const putData = createPutDataForUpdatedLineItem(eachChange);
        promiseTasks.push(moPubApi.updateLineItem(putData, lineItemKey));
      });

      // Making requests
      Promise.allSettled(promiseTasks).then((results) => {
        resolve(results);
      });
    });
  }

  return {
    applyToMoPub: applyToMoPub
  }
})(this);
