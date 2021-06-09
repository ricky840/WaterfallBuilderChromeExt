class LineItem {
  constructor(lineItem, newlyCreated) {
    // Most Frequently Used
    this._key = lineItem.key; // string
    this._name = lineItem.name; // string
    this._bid = lineItem.bid;   // double
    this._adUnitKeys = this.cloneArray(lineItem.adUnitKeys); // string array
    this._includeGeoTargeting = lineItem.includeGeoTargeting; // string
    this._keywords = this.cloneArray(lineItem.keywords); // string array
    this._disallowAutoCpm = lineItem.disallowAutoCpm; // boolean
    this._networkType = lineItem.networkType; // string
    this._orderKey = lineItem.orderKey; // string
    this._orderName = lineItem.orderName; // string
    this._priority = lineItem.priority; // int
    this._autoCpm = lineItem.autoCpm; // double
    this._status = lineItem.status; // string
    this._targetedCountries = this.cloneArray(lineItem.targetedCountries); // string array
    this._type = lineItem.type; // string
    this._enableOverrides = lineItem.enableOverrides; // boolean
    this._overrideFields = clearEmpties(this.cloneObject(lineItem.overrideFields)); // object
    this._idfaTargeting = lineItem.idfaTargeting; // string

    // Device + Carrier + App Targetings + Budget
    this._budget = lineItem.budget; // string
    this._budgetStrategy = lineItem.budgetStrategy; // string
    this._budgetType = lineItem.budgetType; // string
    this._dayParts = this.cloneArray(lineItem.dayParts); // string array
    this._dayPartTargeting = lineItem.dayPartTargeting; // string
    this._deviceTargeting = lineItem.deviceTargeting; // boolean
    this._maxAndroidVersion = lineItem.maxAndroidVersion; // int
    this._minAndroidVersion = lineItem.minAndroidVersion; // double
    this._maxIosVersion = lineItem.maxIosVersion; // int
    this._minIosVersion = lineItem.minIosVersion; // double
    this._targetAndroid = lineItem.targetAndroid; // boolean
    this._targetIos = lineItem.targetIos; // boolean
    this._targetIphone= lineItem.targetIphone; // boolean
    this._targetIpad = lineItem.targetIpad; // boolean
    this._targetIpod = lineItem.targetIpod; // boolean
    this._includeConnectivityTargeting = lineItem.includeConnectivityTargeting; // string
    this._targetedCarriers = this.cloneArray(lineItem.targetedCarriers); // string array
    this._targetedRegions = this.cloneArray(lineItem.targetedRegions); // string array
    this._targetedCities = this.cloneArray(lineItem.targetedCities); // string array
    this._targetedZipCodes = this.cloneArray(lineItem.targetedZipCodes); // string array
    this._userAppsTargeting= this.cloneArray(lineItem.userAppsTargeting); // string array
    this._userAppsTargetingList = this.cloneArray(lineItem.userAppsTargetingList); // string array

    // Frequncy Cap
    this._frequencyCaps = this.cloneArray(lineItem.frequencyCaps); // string array
    this._frequencyCapsEnabled= lineItem.frequencyCapsEnabled; // boolean

    // Start and End
    this._start = lineItem.start; // time
    this._end = lineItem.end; // time

    // Extra
    this._advertiser = lineItem.advertiser; // string
    this._allocationPercentage = lineItem.allocationPercentage; // int
    this._refreshInterval = lineItem.refreshInterval; // int

    // To track change
    this._changes = {};

    // Indicator: if this is a new line item or existing line item
    this._newlyCreated = newlyCreated;
  }

  cloneObject(object) {
    return (object == undefined || object == null) ? object : $.extend(true, {}, object);
  }

  cloneArray(array) {
    return (array == undefined || array == null) ? array : $.extend(true, [], array);
  }

  recordChange(field, oldValue, newValue) {
    // Keep the original value and update newValue only
    if (field in this._changes) {
      this._changes[field].newValue = newValue;
    } else {
      this._changes[field] = {
        orgValue: oldValue,
        newValue: newValue
      }
    }
    // If the newValue is back to original value, then there is no change (used isEqual for deep comparison)
    if (_.isEqual(this._changes[field].orgValue, this._changes[field].newValue)) {
      delete this._changes[field];
    }
  }

  getChanges() {
    // If it is a new line item, then return fields that has values only
    if (this.isNewlyCreated()) {
      let temp_changes = {};
      for (const property in this) {
        if (property == "_changes" || property == "_newlyCreated") continue;

        const key = property.replace(/_/g, "");
        if (this[property] != null || this[property] != undefined) {
           temp_changes[key] = this[property];
        }
      }
      return temp_changes;
    } else {
      return this._changes;
    }
  }

  // getChangesForOnlySupportedFields
  // duplicate
  // 

  isUpdated() {
    return _.isEmpty(this._changes) ? false : true;
  }

  isNewlyCreated() {
    return this._newlyCreated;
  }

  // Update line item. Supported fields only.
  updateLineItem(lineItem) {
    this.setName(lineItem.name);
    this.setBid(lineItem.bid);
    this.setAdUnitKeys(lineItem.adUnitKeys);
    this.setIncludeGeoTargeting(lineItem.includeGeoTargeting);
    this.setKeywords(lineItem.keywords);
    this.setDisallowAutoCpm(lineItem.disallowAutoCpm);
    this.setPriority(lineItem.priority);
    this.setStatus(lineItem.status);
    this.setTargetedCountries(lineItem.targetedCountries);
    this.setEnableOverrides(lineItem.enableOverrides);
    this.setOverrideFields(lineItem.overrideFields);
    this.setBudgetStrategy(lineItem.budgetStrategy);
    this.setBudgetType(lineItem.budgetType);
    this.setFrequencyCaps(lineItem.frequencyCaps);
    this.setFrequencyCapsEnabled(lineItem.frequencyCapsEnabled);
    this.setIdfaTargeting(lineItem.idfaTargeting);
  }

  /*
    Setters (supported field only)
  */

  // Fiend: name
  setName(newName) { 
    if (this._name == newName) return;
    this.recordChange("name", this._name, newName);
    this._name = newName; 
  }

  // Field: bid
  setBid(newBid) { 
    if (this._bid == newBid) return;
    this.recordChange("bid", this._bid, newBid);
    this._bid = newBid; 
  }

  // Field: adUnitKeys (array)
  setAdUnitKeys(newAdUnitKeys) { 
    const clone = this.cloneArray(newAdUnitKeys);
    if (!_.isEmpty(this._adUnitKeys) && !_.isEmpty(clone)) {
      if (_.isEqual(this._adUnitKeys.sort(), clone.sort())) return;
    }
    this.recordChange("adUnitKeys", this._adUnitKeys, clone);
    this._adUnitKeys = clone;
  }

  // Field: includeGeoTargeting
  setIncludeGeoTargeting(newIncludeGeoTargeting) { 
    if (this._includeGeoTargeting == newIncludeGeoTargeting) return;
    this.recordChange("includeGeoTargeting", this._includeGeoTargeting, newIncludeGeoTargeting);
    this._includeGeoTargeting = newIncludeGeoTargeting; 
  }

  // Field: keywords (array)
  setKeywords(newKeywords) {
    const clone = this.cloneArray(newKeywords);
    if (!_.isEmpty(this._keywords) && !_.isEmpty(clone)) {
      if (_.isEqual(this._keywords.sort(), clone.sort())) return;
    }
    this.recordChange("keywords", this._keywords, clone);
    this._keywords = clone; 
  }

  // Field: disallowAutoCpm
  setDisallowAutoCpm(newDisallowAutoCpm) { 
    if (this._disallowAutoCpm == newDisallowAutoCpm) return;
    this.recordChange("disallowAutoCpm", this._disallowAutoCpm, newDisallowAutoCpm);
    this._disallowAutoCpm = newDisallowAutoCpm; 
  }

  // Field: priority
  setPriority(newPriority) { 
    if (this._priority == newPriority) return;
    this.recordChange("priority", this._priority, newPriority);
    this._priority = newPriority; 
  }

  // Field: status
  setStatus(newStatus) { 
    if (this._status == newStatus) return;
    this.recordChange("status", this._status, newStatus);
    this._status = newStatus; 
  }

  // Field: targetedCountries (array)
  setTargetedCountries(newTargetedCountries) { 
    const clone = this.cloneArray(newTargetedCountries);
    if (!_.isEmpty(this._targetedCountries) && !_.isEmpty(clone)) {
      if (_.isEqual(this._targetedCountries.sort(), clone.sort())) return;
    }
    this.recordChange("targetedCountries", this._targetedCountries, clone);
    this._targetedCountries = clone; 
  }

  // Field: enableOverrides
  setEnableOverrides(newEnableOverrides) { 
    if (this._enableOverrides == newEnableOverrides) return;
    this.recordChange("enableOverrides", this._enableOverrides, newEnableOverrides);
    this._enableOverrides = newEnableOverrides; 
  }

  // Field: overrideFields (object)
  setOverrideFields(newOverrideFields) { 
    const clone = clearEmpties(this.cloneObject(newOverrideFields));
    if (_.isEqual(this._overrideFields, clone)) return;
    this.recordChange("overrideFields", this._overrideFields, clone);
    this._overrideFields = clone;
  }

  // Field: budgetStrategy
  setBudgetStrategy(newBudgetStrategy) { 
    if (this._budgetStrategy == newBudgetStrategy) return;
    this.recordChange("budgetStrategy", this._budgetStrategy, newBudgetStrategy);
    this._budgetStrategy = newBudgetStrategy; 
  }

  // Field: budgetType
  setBudgetType(newBudgetType) { 
    if (this._budgetType == newBudgetType) return;
    this.recordChange("budgetType", this._budgetType, newBudgetType);
    this._budgetType = newBudgetType; 
  }

  // Field: frequencyCaps (array)
  setFrequencyCaps(newFrequencyCaps) {
    const clone = this.cloneArray(newFrequencyCaps);
    if (!_.isEmpty(this._frequencyCaps) && !_.isEmpty(clone)) {
      if (_.isEqual(this._frequencyCaps.sort(), clone.sort())) return;
    }
    this.recordChange("frequencyCaps", this._frequencyCaps, clone);
    this._frequencyCaps = clone; 
  }

  // Field: frequencyCapsEnabled
  setFrequencyCapsEnabled(newFrequencyCapsEnabled) { 
    if (this._frequencyCapsEnabled == newFrequencyCapsEnabled) return;
    this.recordChange("frequencyCapsEnabled", this._frequencyCapsEnabled, newFrequencyCapsEnabled);
    this._frequencyCapsEnabled = newFrequencyCapsEnabled; 
  }

  // Field: idfaTargeting (string)
  setIdfaTargeting(newIdfaTargeting) { 
    if (this._idfaTargeting == newIdfaTargeting) return;
    this.recordChange("idfaTargeting", this._idfaTargeting, newIdfaTargeting);
    this._idfaTargeting = newIdfaTargeting; 
  }

  /*
    Getters
  */

  getKey() { return this._key; }
  getName() { return this._name; }
  getBid() { return this._bid; }
  getAdUnitKeys() { return this._adUnitKeys; }
  getIncludeGeoTargeting() { return this._includeGeoTargeting; }
  getKeywords() { return this._keywords; }
  getDisallowAutoCpm() { return this._disallowAutoCpm; }
  getNetworkType() { return this._networkType; }
  getOrderKey() { return this._orderKey; }
  getOrderName() { return this._orderName; }
  getPriority() { return this._priority; }
  getAutoCpm() { return this._autoCpm; }
  getStatus() { return this._status; }
  getTargetedCountries() { return this._targetedCountries; }
  getType() { return this._type; }
  getEnableOverrides() { return this._enableOverrides; }
  getOverrideFields() { return this._overrideFields; }
  getBudget() { return this._budget; }
  getBudgetStrategy() { return this._budgetStrategy; }
  getBudgetType() { return this._budgetType; }
  getDayParts() { return this._dayParts; }
  getDayPartTargeting() { return this._dayPartTargeting; }
  getDeviceTargeting() { return this._deviceTargeting; }
  getMaxAndroidVersion() { return this._maxAndroidVersion; }
  getMinAndroidVersion() { return this._minAndroidVersion; }
  getMaxIosVersion() { return this._maxIosVersion; }
  getMinIosVersion() { return this._minIosVersion; }
  getTargetAndroid() { return this._targetAndroid; }
  getTargetIos() { return this._targetIos; }
  getTargetIphon() { return this._targetIphon; }
  getTargetIpad() { return this._targetIpad; }
  getTargetIpod() { return this._targetIpod; }
  getIncludeConnectivityTargeting() { return this._includeConnectivityTargeting; }
  getTargetedCarriers() { return this._targetedCarriers; }
  getTargetedRegions() { return this._targetedRegions; }
  getTargetedCities() { return this._targetedCities; }
  getTargetedZipCodes() { return this._targetedZipCodes; }
  getUserAppsTargetin() { return this._userAppsTargetin; }
  getUserAppsTargetingList() { return this._userAppsTargetingList; }
  getFrequencyCaps() { return this._frequencyCaps; }
  getFrequencyCapsEnable() { return this._frequencyCapsEnable; }
  getStart() { return this._start; }
  getEnd() { return this._end; }
  getAdvertiser() { return this._advertiser; }
  getAllocationPercentage() { return this._allocationPercentage; }
  getRefreshInterval() { return this._refreshInterval; }
  getIdfaTargeting() { return this._idfaTargeting; }
}
