var lineItemStore = (function(global) {
  "use strict";

  // Current line item store. It stores line item instance
  let lineItemObjStore = []; 

  // Accepts regular object
  function saveLineItem(lineItem, newlyCreated = false) {
    const lineItemObject = new LineItem(lineItem, newlyCreated);
    lineItemObjStore.push(lineItemObject);
    // Debug
    // console.log(`new line item saved`);
    // console.log(lineItemObject);
    // console.log("--------");
  }

  // Accepts regular objects
  function saveLineItems(lineItems, newlyCreated = false) {
    lineItems.forEach(item => {
      saveLineItem(item, newlyCreated);
    });
  }

  // Accepts regular objects
  function initLineItemStore(lineItems, newlyCreated = false) {
    lineItemObjStore = [];
    lineItems.forEach(item => {
      saveLineItem(item, newlyCreated);
    });
  }

  // Accepts regular object
  function updateLineItem(lineItem) {
    for (let i=0; i < lineItemObjStore.length; i++) {
      if (lineItemObjStore[i].getKey() == lineItem.key) {
        lineItemObjStore[i].updateLineItem(lineItem);
      }
    }
  }

  // Returns line item object class instance
  function getLineItemByKey(key) {
    for (let i=0; i < lineItemObjStore.length; i++) {
      if (lineItemObjStore[i].getKey() == key) {
        return lineItemObjStore[i];
      }
    }
  }

  function getTotalNumberOfChanges() {
    let changeCount = 0;
    lineItemObjStore.forEach((lineItem) => {
      const changes = lineItem.getChanges();
      if (!_.isEmpty(changes)) changeCount += 1;
    });
    return changeCount;
  }

  function getLineItems() {
    return lineItemObjStore;
  }

  // Returns line item object class instances
  function getChangedLineItems() {
    let changedLineItems = [];
    lineItemObjStore.forEach((lineItem) => {
      if (lineItem.isUpdated() || lineItem.isNewlyCreated()) {
        changedLineItems.push(lineItem);
      }
    });
    return changedLineItems;
  }

  return {
    saveLineItem: saveLineItem,
		saveLineItems: saveLineItems,
    initLineItemStore: initLineItemStore,
    updateLineItem: updateLineItem,
    getLineItemByKey: getLineItemByKey,
    getTotalNumberOfChanges: getTotalNumberOfChanges,
    getLineItems: getLineItems,
    getChangedLineItems: getChangedLineItems
  }
})(this);