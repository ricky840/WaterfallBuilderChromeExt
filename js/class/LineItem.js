class LineItem {
  constructor(lineItem, newlyCreated) {
    // Most Frequently Used
    this._key = lineItem.key;
    this._name = lineItem.name; // Edit Supported
    this._bid = lineItem.bid;   // Edit Supported
    this._adUnitKeys = lineItem.adUnitKeys; // Edit Supported
    this._includeGeoTargeting = lineItem.includeGeoTargeting; // Edit Supported
    this._keywords = lineItem.keywords; // Edit Supported
    this._disallowAutoCpm = lineItem.disallowAutoCpm; // Edit Supported
    this._networkType = lineItem.networkType;
    this._orderKey = lineItem.orderKey;
    this._orderName = lineItem.orderName;
    this._priority = lineItem.priority; // Not Supported? (need to check)
    this._autoCpm = lineItem.autoCpm;
    this._status = lineItem.status; // Edit Supported (enabled, archived)
    this._targetedCountries = lineItem.targetedCountries; // Edit Supported
    this._type = lineItem.type;
    this._enableOverrides = lineItem.enableOverrides; // Edit Supported
    this._overrideFields = lineItem.overrideFields; // Edit Supported

    // Device + Carrier + App Targetings + Budget
    this._budget = lineItem.budget; // Edit Supported
    this._budgetStrategy = lineItem.budgetStrategy; // Edit Supported
    this._budgetType = lineItem.budgetType; // Edit Supported
    this._dayParts = lineItem.dayParts;
    this._dayPartTargeting = lineItem.dayPartTargeting;
    this._deviceTargeting = lineItem.deviceTargeting;
    this._maxAndroidVersion = lineItem.maxAndroidVersion;
    this._minAndroidVersion = lineItem.minAndroidVersion;
    this._maxIosVersion = lineItem.maxIosVersion;
    this._minIosVersion = lineItem.minIosVersion;
    this._targetAndroid = lineItem.targetAndroid;
    this._targetIos = lineItem.targetIos;
    this._targetIphone= lineItem.targetIphone;
    this._targetIpad = lineItem.targetIpad;
    this._targetIpod = lineItem.targetIpod;
    this._includeConnectivityTargeting = lineItem.includeConnectivityTargeting;
    this._targetedCarriers = lineItem.targetedCarriers;
    this._targetedRegions = lineItem.targetedRegions;
    this._targetedCities = lineItem.targetedCities; 
    this._targetedZipCodes = lineItem.targetedZipCodes;
    this._userAppsTargeting= lineItem.userAppsTargeting;
    this._userAppsTargetingList = lineItem.userAppsTargetingList;

    // Frequncy Cap
    this._frequencyCaps = lineItem.frequencyCaps; // Edit Supported
    this._frequencyCapsEnabled= lineItem.frequencyCapsEnabled; // Edit Supported

    // Start and End
    this._start = lineItem.start;
    this._end = lineItem.end;

    // Extra
    this._advertiser = lineItem.advertiser;
    this._allocationPercentage = lineItem.allocationPercentage;
    this._refreshInterval = lineItem.refreshInterval;

    // To track change
    this._changes = {};

    // Indicator: if this is a new line item or existing
    this._newlyCreated = newlyCreated;
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
    // If the newValue is back to original value, then there is no change
    if (this._changes[field].orgValue == this._changes[field].newValue) delete this._changes[field];
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

  isUpdated() {
    return _.isEmpty(this._changes) ? false : true;
  }

  isNewlyCreated() {
    return this._newlyCreated;
  }

  // Update line item. Supported (editable) fields only)
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
  }

  /*
    Setters 
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

  // Field: adUnitKeys
  setAdUnitKeys(newAdUnitKeys) { 
    if (this._adUnitKeys == newAdUnitKeys) return;
    this.recordChange("adUnitKeys", this._adUnitKeys, newAdUnitKeys);
    this._adUnitKeys = newAdUnitKeys; 
  }

  // Field: includeGeoTargeting
  setIncludeGeoTargeting(newIncludeGeoTargeting) { 
    if (this._includeGeoTargeting == newIncludeGeoTargeting) return;
    this.recordChange("includeGeoTargeting", this._includeGeoTargeting, newIncludeGeoTargeting);
    this._includeGeoTargeting = newIncludeGeoTargeting; 
  }

  // Field: keywords
  setKeywords(newKeywords) { 
    if (this._keywords == newKeywords) return;
    this.recordChange("keywords", this._keywords, newKeywords);
    this._keywords = newKeywords; 
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

  // Field: targetedCountries
  setTargetedCountries(newTargetedCountries) { 
    if (this._targetedCountries == newTargetedCountries) return;
    this.recordChange("targetedCountries", this._targetedCountries, newTargetedCountries);
    this._targetedCountries = newTargetedCountries; 
  }

  // Field: enableOverrides
  setEnableOverrides(newEnableOverrides) { 
    if (this._enableOverrides == newEnableOverrides) return;
    this.recordChange("enableOverrides", this._enableOverrides, newEnableOverrides);
    this._enableOverrides = newEnableOverrides; 
  }

  // Field: overrideFields
  setOverrideFields(newOverrideFields) { 
    if (this._overrideFields == newOverrideFields) return;
    this.recordChange("overrideFields", this._overrideFields, newOverrideFields);
    this._overrideFields = newOverrideFields; 
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

  // Field: frequencyCaps
  setFrequencyCaps(newFrequencyCaps) { 
    if (this._frequencyCaps == newFrequencyCaps) return;
    this.recordChange("frequencyCaps", this._frequencyCaps, newFrequencyCaps);
    this._frequencyCaps = newFrequencyCaps; 
  }

  // Field: frequencyCapsEnabled
  setFrequencyCapsEnabled(newFrequencyCapsEnabled) { 
    if (this._frequencyCapsEnabled == newFrequencyCapsEnabled) return;
    this.recordChange("frequencyCapsEnabled", this._frequencyCapsEnabled, newFrequencyCapsEnabled);
    this._frequencyCapsEnabled = newFrequencyCapsEnabled; 
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
}
