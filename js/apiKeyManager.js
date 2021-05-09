var apiKeyManager = (function(global) {
	"use strict";

  let activeApiKey = {};

  function updateHtmlList(apiKeyList) {
    let html = "";
    if (_.isEmpty(apiKeyList)) {
      html = `
        <div class="ui message">
          <div class="header">No API keys are available</div>
          <p>You can obtain your API key from "Account settings" page in MoPub dashboard</p>
        </div>`;
    } else {
      apiKeyList.forEach(apiKey => {
        const powerIconColor = (apiKey.active == true) ? "green" : "disabled";
        const item = `
          <div class="item">
            <div class="right floated content">
              <button class="ui grey tertiary button apikey-use-btn">Use</button>
              <button class="ui grey tertiary button apikey-delete-btn">Delete</button>
            </div>
            <i class="big power off middle aligned icon ${powerIconColor}"></i>
            <div class="content">
              <a class="header">${apiKey.name}</a>
              <div class="description apikey-value">${apiKey.key}</div>
            </div>
          </div>`;
        html += item;
      });
    }
    $(".apikey-manage-modal .list").html(html);
  }

  function saveApiKey(newApiKey) {
    chrome.storage.local.get("apiKeys", function(result) {
      let apiKeyList = result['apiKeys'];
      for (const apiKey of apiKeyList) {
        if (apiKey.key == newApiKey.key) {
          $('body').toast({
            class: "error",
            message: "Same API Key exists"
          });
          return; // Do not add the duplicated key
        }
      }
      newApiKey["active"] = false;
      apiKeyList.push(newApiKey);
      chrome.storage.local.set({ apiKeys: apiKeyList }, function() {
        updateHtmlList(apiKeyList);
      });
    }); 
  }

  function parseInput(formData) {
    let userInput = {};
    for (const each of formData) {
      const value = each.value.trim();
      if (_.isEmpty(value)) return false;

      switch(each.name) {
        case "apikey-name":
          userInput["name"] = value;
        break;
        case "apikey-key":
          userInput["key"] = value;
        break;
      }
    }
    return userInput;
  }

  function loadApiKeys() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("apiKeys", function(result) {
        let apiKeyList = result['apiKeys'];
        updateHtmlList(apiKeyList);
        for (const apiKey of apiKeyList) {
          if (apiKey.active == true) {
            activeApiKey = apiKey;
            break;
          }
        }
        (_.isEmpty(activeApiKey)) ? reject() : resolve();
      }); 
    });
  }

  function activateApiKey(key) {
    chrome.storage.local.get("apiKeys", function(result) {
      let apiKeyList = result['apiKeys'];
      apiKeyList.forEach(apiKey => {
        if (apiKey.key == key) {
          apiKey.active = true;
          activeApiKey = apiKey;
        } else {
          apiKey.active = false;
        }
      });
      chrome.storage.local.set({ apiKeys: apiKeyList }, function() {
        updateHtmlList(apiKeyList);
        updateActiveApiKeyHtml();
      });
    }); 
  }

  function deleteApiKey(key) {
    chrome.storage.local.get("apiKeys", function(result) {
      let apiKeyList = result['apiKeys'];
      let newApiKeyList = [];
      for (const apiKey of apiKeyList) {
        if (apiKey.key != key) {
          newApiKeyList.push(apiKey);
        }
      }
      chrome.storage.local.set({ apiKeys: newApiKeyList }, function() {
        updateHtmlList(newApiKeyList);
      });
    }); 
  }

  function getActiveApiKey() {
    return _.isEmpty(activeApiKey) ? false : activeApiKey;
  }

  function updateActiveApiKeyHtml() {
    const apiKey = getActiveApiKey();
    if (apiKey) $("#info-api-key").html(apiKey.name);
  }

  return {
    parseInput: parseInput,
    saveApiKey: saveApiKey,
    loadApiKeys: loadApiKeys,
    deleteApiKey: deleteApiKey,
    activateApiKey: activateApiKey,
    getActiveApiKey: getActiveApiKey,
    updateActiveApiKeyHtml: updateActiveApiKeyHtml
  }
})(this);
