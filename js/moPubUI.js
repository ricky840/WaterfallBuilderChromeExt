var moPubUI = (function(global) {
  'use strict';

	let numberOfChangesToUpdate = 0;
	let updateResultMessage = "";

  function updateWaterfall(lineItemChanges, callback) {

		let changes = refineChanges(lineItemChanges);

		// Debug Temp
		// console.log("All changes");
		// console.log(changes)
		// return false;

		// Get number of change objects
		numberOfChangesToUpdate = (_.keys(changes)).length;
		
		// Show loaders
		loadingIndicator.setTotalBarLoader(numberOfChangesToUpdate);
		loadingIndicator.showBarLoader();
		$(".updating-message").html(`Updating MoPub UI, remaining ${numberOfChangesToUpdate}`);
		$(".all-content-wrapper").dimmer("show");

    for (let lineItemKey in changes) {
      let action = changes[lineItemKey].action;
      let type = changes[lineItemKey].type;
      let networkType = changes[lineItemKey].networkType;
			let lineItemName = changes[lineItemKey].lineItemName;
      let updatedFields = changes[lineItemKey].updatedFields;

      // Default update lineitem API
      let endPoint = `${UPDATE_LINEITEM}?key=${lineItemKey}`;

			// Action can be new, update and delete
			if (action == "new") {
				console.log(`Will create new line item: ${lineItemName} ${lineItemKey}`);
				endPoint = `${CREATE_LINEITEM}`;
			}

      // Default Marketplace should use AdSource update endpoint.
      if (type == "marketplace") {
        endPoint = `${UPDATE_ADSOURCE}?key=${lineItemKey}&type=marketplace`;
      }

      let request = {
        url: BASE_URL + endPoint,
        data: updatedFields,
				headers: { "Content-Type": "application/json; charset=utf-8" }
      };

      http.postRequest(request).then(function(result) {
				console.log(`Successfully updated MoPub UI - ${lineItemKey}`);
				console.log(result);
				let message = `
					<div class="update-success-lineitem">
						StatusCode: <b>${result.statusCode}</b>, Name: <b>${lineItemName}</b>, Key: <b>${lineItemKey}</b>
					</div>`;
				trackNumberOfUpdates(callback, message);
      }).catch(function(error) {
				console.log("Failed to update MoPub UI");
        console.log(error);
				let message = `
					<div class="update-fail-lineitem">
						StatusCode: <b>${error.statusCode}</b>, Name: <b>${lineItemName}</b>, Key: <b>${lineItemKey}</b>, Error: ${error.responseText}
					</div>`;
				trackNumberOfUpdates(callback, message);
      });
    }
  }

	function refineChanges(changes) {

		// Temp
		// console.log("Raw changes");
		// console.log(JSON.stringify(changes));

		let dontUpdateLineItems = [];

		for (let lineItemKey in changes) {
			let eachChange = changes[lineItemKey];
			let type = eachChange.type;
			let networkType = eachChange.networkType;
			let action = eachChange.action;
			let updatedFields = eachChange.updatedFields;

			if (action == "new") {
				updatedFields = convertResToReqBody(updatedFields);
				// Assign current ad unit key for new line item, only when there is nothing specified. (Default)
				// Otherwise, Change object should have it already.
				if (!("adUnitKeys" in updatedFields)) {
					updatedFields["adUnitKeys"] = [AdUnitId];
				}
			}

			// First, clean up all empty fields.
			updatedFields = clearEmpties(updatedFields);

			// "status" field should be replaced with "enabled" field name
			if ("status" in updatedFields) {
				let value = updatedFields.status;
				switch(value) {
					case "running":
						updatedFields.enabled = true;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					case "paused":
						updatedFields.enabled = false;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					case "archived":
						updatedFields.enabled = false;
						updatedFields.archived = true;
						delete updatedFields.status;
						break;
					case "unarchived":
						updatedFields.enabled = true;
						updatedFields.archived = false;
						delete updatedFields.status;
						break;
					default:
						// Should be one of above if not, don't update status.
						delete updatedFields.status;
				}
			}

      // For marketplace, status field should be replaced with enabled only.
			// It doesn't use archived field.
			if (type == "marketplace") {
				delete updatedFields.archived;
				if ("bid" in updatedFields) {
          updatedFields.cpm = updatedFields.bid;
          delete updatedFields.bid;
        }
			}

			// For updating line item, it should not update orderName and orderKey
			if (action != "new") {
				delete updatedFields.orderName;
				delete updatedFields.orderKey;
			}

			// If OverrideFields exist, update enableOverrides to true
			if (_.has(updatedFields, "overrideFields")) {
				updatedFields.enableOverrides = true;
			}

			// To be safe, remove enableOverrides and overrideFields if it is non-network type
			// Only network type can have autocpm related
			if (type != "network") {
				delete updatedFields.enableOverrides;
				delete updatedFields.overrideFields;
				delete updatedFields.disallowAutoCpm;
			}

			// Only network and mpx_line_item type can have privatekeywork option (see UI)
			if (updatedFields.type != "network" || updatedFields.type != "mpx_line_item") {
				delete updatedFields.enablePrivateKeywords;
			}

			// If there is update for targeted city, change format. Fucking jesus.
			if ("targetedCities" in updatedFields) {
				for (let i=0; i < updatedFields["targetedCities"].length; i++) {
					let info = updatedFields.targetedCities[i];
					updatedFields.targetedCities[i] = `(${info.latitude},${info.longitude},'${info.cityName}','${info.regionName}','${info.countryCode}')`;
				}
			}

			// OverridesFields validation. If validation fails, do not proceed the update.
			if (type == "network" && _.has(updatedFields, "overrideFields")) {
				try {
					updatedFields.overrideFields = overrideFieldValidator.validate(networkType, updatedFields.overrideFields)
				} catch (error) {
					notifier.show({
						header: "Validation Error",
						type: "negative",
						message: `Key: <b>${lineItemKey}</b> ${error}`,
						append: true
					});
					return false;
				}
			}

			// Remove Lineitem that has empty updatedFields - no need to make update API call to update.
			if (_.isEmpty(updatedFields)) {
				dontUpdateLineItems.push(lineItemKey);
			}
		}
	
		// Remove from the update list
		for (let i=0; i < dontUpdateLineItems.length; i++) {
			delete changes[dontUpdateLineItems[i]];
		}

		return changes;
	}

	function convertResToReqBody(responseObj) {
		// This will convert line item response to request body to create lineitem
		// Fields exist only in response should be removed when create a lineitem
		delete responseObj.advertiser;
		delete responseObj.disabled;
		delete responseObj.filterLevel;
		delete responseObj.network;
		delete responseObj.categoryBlocklist;
		delete responseObj.appBlocklist;
		delete responseObj.status;
		delete responseObj.dspWhitelist;
		delete responseObj.started;
		delete responseObj.creatives;
		delete responseObj.orderName;
		delete responseObj.key;
		delete responseObj.active;
		delete responseObj.pmpDealFields;
		delete responseObj.attributeBlocklist;
		delete responseObj.allowVideo
		delete responseObj.domainBlocklist;
		delete responseObj.visible;
		delete responseObj.videoSetting;
		delete responseObj.autoCpm;
		delete responseObj.targetOther;
		responseObj.start = getCurrentDatetimeUTC("ISO-8601");
		responseObj.startImmediately = true;
		return responseObj;
	}

	function trackNumberOfUpdates(callback, message) {
		loadingIndicator.increaseBar();
		updateResultMessage += message;

		numberOfChangesToUpdate--;
		$(".updating-message").html(`Updating MoPub UI, remaining ${numberOfChangesToUpdate}`);
		console.log(`Remaining number of updates(MoPub UI): ${numberOfChangesToUpdate}`);

		if (numberOfChangesToUpdate == 0) {
			notifier.clear();
			notifier.show({
				header: `Update Completed. ${loadingIndicator.getBarLength()} Item(s)`,
				message: updateResultMessage,
				append: true
			});
			updateResultMessage = ""; // Result Message Reset
			loadingIndicator.hideBarLoader();
			callback();
		}
	}

  return {
		refineChanges: refineChanges,
		updateWaterfall: updateWaterfall
  }
})(this);
