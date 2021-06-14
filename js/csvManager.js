var csvManager = (function(global) {
	"use strict";

	const colNames = [
		"Name (Required)",
		"Line Item Key (Required. Leave EMPTY if new)",
		"Order Name (Required)",
		"Order Key (Required)",
		"Assigned Ad Unit Keys (Required, Comma separated)",
		"Priority (Required. Enter between 1 ~ 16)",
		"CPM (Required)",
		"Type (Required)",
		"Network Type (Required for Network)",
		"Network Account Id (Based on network)",
		"Network AdUnit Id (Based on network)",
		"Network App Id (Based on network)",
		"Placement Id (Mintegral only)",
		"Network App Signature (Chartboost only)",
		"Network Location (Chartboost only)",
		"Custom Event ClassName (Custom network only)",
		"Custom Event ClassData (Custom network only)",
		"Status (Required)",
		"IDFA Targeting (Required)",
		"Keywords (Optional. Comma separated)",
		"GeoTargetingMode(Required. If 'all', countires will be ignored)",
		"Countries (Optional. Comma separated)"
	];

	function exportToFile(exportData) {
		const adUnitKey = adUnitManager.getCurrentAdUnitKey();
		const adUnitName = adUnitManager.getCurrentAdUnitName();
		let exportImportableData = [];

		if (_.isEmpty(exportData)) {
			/**
			 * If there is nothing to export, export columns only
			 * Feedback from Tara (5/28/2021)
			 */
			const titleRow = {};
			colNames.forEach(column => {
				titleRow[column] = "";
			});
			exportImportableData.push(titleRow);
		} else {
			for (let i=0; i < exportData.length; i++) {
				let eachLineItem = exportData[i];
				exportImportableData.push({
					[colNames[0]]: eachLineItem.name,
					[colNames[1]]: eachLineItem.key,
					[colNames[2]]: eachLineItem.orderName,
					[colNames[3]]: eachLineItem.orderKey,
					[colNames[4]]: eachLineItem.adUnitKeys,
					[colNames[5]]: eachLineItem.priority,
					[colNames[6]]: eachLineItem.bid,
					[colNames[7]]: eachLineItem.type,
					[colNames[8]]: eachLineItem.networkType,
					[colNames[9]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_account_id,
					[colNames[10]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_adunit_id,
					[colNames[11]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_app_id,
					[colNames[12]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.placement_id,
					[colNames[13]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.app_signature,
					[colNames[14]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.location,
					[colNames[15]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.custom_event_class_name,
					[colNames[16]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.custom_event_class_data,
					[colNames[17]]: eachLineItem.status,
					[colNames[18]]: eachLineItem.idfaTargeting,
					[colNames[19]]: eachLineItem.keywords,
					[colNames[20]]: eachLineItem.includeGeoTargeting,
					[colNames[21]]: eachLineItem.targetedCountries
				});
			}
		}
		let exportCsv = Papa.unparse(exportImportableData);
		let hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(exportCsv);
		hiddenElement.target = '_blank';
		hiddenElement.download = `Importable_${adUnitName.replace(/\s+/g, "-")}_${adUnitKey}_${getCurrentTimeInEpoch()}.csv`;
		hiddenElement.click();
	}

	function downloadCsvAll() {
		const adUnitKey = adUnitManager.getCurrentAdUnitKey();
		const adUnitName = adUnitManager.getCurrentAdUnitName();
		let filename = `${adUnitName.replace(/\s+/g, "-")}_${adUnitKey}_${getCurrentTimeInEpoch()}.csv`;
		WaterfallTable.download("csv", filename);
	}

	function downloadCsv() {
		const selectedData = WaterfallTable.getSelectedData();
		let filteredData = [];
		for (const lineItem of selectedData) {
			/**
			 *  Skip marketplace tab, advanced_bidding, custom JS network (custom)
			 *  and status that is NOT running/paused/archived
			 */  
			const statusRegex = /^running$|^paused$|^archived$/;
			const typeRegex = /^marketplace$|^advanced_bidding_mpx$|^advanced_bidding_network$|^pmp_line_item$|^segment$/;
			if (!statusRegex.test(lineItem.status)) continue;
			if (typeRegex.test(lineItem.type)) continue;
			if (lineItem.networkType == "custom") continue;
			filteredData.push(lineItem);
		}
		exportToFile(filteredData);
	}

	function updateTableWithImported(parsedDataList) {
		return new Promise(async (resolve, reject) => {
			// Set progress bar
			progressBar.setTotal(parsedDataList.length, "Importing..");
			WaterfallTable.blockRedraw();

			for (let currentData of parsedDataList) {
				// See if data exists in the table
				const row = WaterfallTable.searchData("key", "=", currentData.key);
				try {
					// Existing line item. Ignore order name and order key. It can't be updated anyway.
					if (row.length == 1) {
						delete currentData.orderName;
						delete currentData.orderKey;
						WaterfallTable.updateData([currentData]);
					}
					// New line item, this requires order key. Otherwise throw error. order name will be ignored.
					if (row.length == 0) {
						if ("orderKey" in currentData) {
							WaterfallTable.addData([currentData]);
						} else {
							throw new Error(`New line item <b>${currentData.name}</b> requires order key.`);
						}
					}
				} catch (error) {
					NOTIFICATIONS.importValidationError.message = error;
					notifier.show(NOTIFICATIONS.importValidationError);
					WaterfallTable.restoreRedraw();
					reject();
					return;
				}
				progressBar.increase();
				await delay(1); // Give it a delay to show the progress bar, otherwise it won't show
			}

			// Import success
			NOTIFICATIONS.importSuccessful.message = `${parsedDataList.length} line items were imported. Unnecessary overrides fields for network line items were ignored.`;
			notifier.show(NOTIFICATIONS.importSuccessful);
			WaterfallTable.restoreRedraw();
			progressBar.reset();
			resolve();
		});
	}

	function validateImportFileFormat(file) {
		return new Promise((resolve, reject) => {
			Papa.parse(file, {
				config: { comments: true, skipEmptyLines: true, preview: 1 },
				complete: function(results, file) {
					for (let i=0; i < results.data[0].length; i++) {
						if (results.data[0][i] != colNames[i]) {
							const msg = `Please check if uploaded file is in importable format. Column name "${colNames[i]}" does not match.`;
							NOTIFICATIONS.importUnsuccessful.message = msg;
							notifier.show(NOTIFICATIONS.importUnsuccessful);
							resolve(false);
							return;
						}
					}
					resolve(true);
				}
			});
		});
	}

	function processUpload(file) {
		return new Promise(async (resolve, reject) => {
			const formatValidation = await validateImportFileFormat(file);
			if (!formatValidation) {
				reject();
				return;
			}
			Papa.parse(file, {
				config: { comments: true, skipEmptyLines: true, worker: true },
				complete: async function (results, file) {
					// Parse each row, if there is an error with parsing row, it will return false
					const parsedDataList = csvManager.rowParser(results.data);
					if (_.isEmpty(parsedDataList)) {
						console.log("There is no item to import");
						reject();
						return;
					}
					try {
						await updateTableWithImported(parsedDataList);
						resolve();
					} catch (error) {
						reject();
					}
				}
			});
		});
	}

	function rowParser(data) {
		let uploadData = [];
		let rowObj = {};

		// i=0 is title row
		for (let i=1; i < data.length; i++) {
			let [name, key, orderName, orderKey, adUnitKeys, priority, bid, type, networkType, 
				networkAccountId, networkAdUnitId, networkAppId, networkPlacementId, networkAppSignature, networkLocation,
				customEventClassName, customEventClassData, status, idfaTargeting, keywords, geoMode, countries] = data[i];

			// Process rows only has the right number of columns (to prevent empty row at the end)
			if (data[i].length != colNames.length) continue;

			let overrideFields = {
				'network_account_id': networkAccountId.toString().trim(),
				'network_adunit_id': networkAdUnitId.toString().trim(),
				'network_app_id': networkAppId.toString().trim(),
				'placement_id': networkPlacementId.toString().trim(),
				'app_signature': networkAppSignature.toString().trim(),
				'location': networkLocation.toString().trim(),
				'custom_event_class_name': customEventClassName.toString().trim(),
				'custom_event_class_data': customEventClassData.toString().trim()
			};

			try {
				rowObj = {
					'name': csvFieldValidator('name', name),
					'key': (key.toString().trim() == "") ? undefined : csvFieldValidator('key', key),
					'orderName': csvFieldValidator('orderName', orderName),
					'orderKey': csvFieldValidator('orderKey', orderKey), 
					'adUnitKeys': csvFieldValidator('adUnitKeys', adUnitKeys),
					'priority': csvFieldValidator('priority', priority),
					'bid': csvFieldValidator('bid', bid),
					'type': csvFieldValidator('type', type),
					'networkType': (type == "network") ? csvFieldValidator('networkType', networkType) : undefined,
					'overrideFields': (type == "network") ? overrideFieldValidator.validate(networkType, overrideFields) : undefined, // unified overridesfield form
					'status': csvFieldValidator('status', status),
					'idfaTargeting': csvFieldValidator('idfaTargeting', idfaTargeting),
					'keywords': csvFieldValidator('keywords', keywords),
					'includeGeoTargeting': csvFieldValidator('includeGeoTargeting', geoMode),
					'targetedCountries': (geoMode == "all") ? [] : csvFieldValidator('targetedCountries', countries),
				};

				// See if order key and order name matches, otherwise throw error
				let row = OrderTable.searchData("key", "=", rowObj.orderKey);
				if (row[0].name != rowObj.orderName) {
					throw new Error(`Imported line item <b>${rowObj.name}</b>(${rowObj.key}) <b>order key</b> and <b>order name</b> does not match.`);
				}
		
				// Assign temp id for (empty key) new line item
				rowObj.key = (_.isEmpty(rowObj.key)) ? `temp-${stringGen(32)}` : rowObj.key;

				// Data ready, save.
				uploadData.push(rowObj);

			} catch(error) {
				NOTIFICATIONS.importValidationError.message = `[Line ${i+1}] ${error}`;
				notifier.show(NOTIFICATIONS.importValidationError);
				return false;
			}

			// Temp
			// console.log('Row Parsed');
			// console.log(rowObj);
		}
		return uploadData;
	}

	function csvFieldValidator(fieldKey, value) {
		let returnValue;
		let regex;

		value = value.toString().trim();

		switch (fieldKey) {
			case "name":
				if (value == "") {
					throw new Error(`Name cannot be empty.`);
				} else {
					returnValue = value;	
				}
				break;
			case "key":
				regex = /^[0-9|a-z]{32}$/;
				if (regex.test(value)) {
					returnValue = value;
				} else {
					throw new Error(`Line item key is not in the right format. <b>${value}</b>`);
				}
				break;
			case "adUnitKeys":
				regex = /^[0-9|a-z]{32}$/;
				const adUnitKeys = value.split(",");
				// Make sure to include the current ad unit key in adUnitKeys when import CSV (IMPORTANT)
				let newAdUnitKeys = [adUnitManager.getCurrentAdUnitKey()];
				adUnitKeys.forEach(key => {
					if (_.isEmpty(key.trim()) || !regex.test(key.trim())) {
						throw new Error(`Ad unit key is not in the right format. <b>${value}</b>`);
					}
					newAdUnitKeys.push(key.trim());
				});
				returnValue = _.uniq(newAdUnitKeys);
				break;
			case "orderName":
				if (value == "") {
					throw new Error(`Order name cannot be empty.`);
				} else {
					let result = validateOrderName(value);
					returnValue = result;	
				}
				break;
			case "orderKey":
				regex = /^[0-9|a-z]{32}$/;
				if (regex.test(value)) {
					// See if this order key exists in the OrderTable, otherwise throw an error.
					let result = validateOrderKey(value);
					returnValue = result;
				} else {
					throw new Error(`Order key is not in the right format. <b>${value}</b>`);
				}
				break;
			case "priority":
				regex = /^[1-9]$|^1[0-6]$/;
				if (regex.test(value)) {
					returnValue = parseInt(value);
				} else {
					throw new Error(`Wrong Priority. Make sure it is between 1 - 16 (integer). <b>${value}</b>`);
				}
				break;
			case "bid":
				regex = /^[0-9]{1,4}$|^[0-9]{1,4}\.\d+$/;
				if (regex.test(value)) {
					returnValue = parseFloat(value);
				} else {
					throw new Error(`CPM is not a valid number. It should be within 0 ~ 9999 range. <b>${value}</b>`);
				}
				break;
			case "type":
				regex = /^gtee$|^mpx\_line\_item$|^network$|^promo$|^non_gtee$|^backfill\_promo$/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`Item type is not valid. <b>${value}</b> The ItemType can only be gtee, mpx_line_item, network, promo, non_gtee, backfill_promo and cannot be updated.`);
				}
				break;
			case "networkType":
				regex = /^admob_native$|^applovin_sdk$|^adcolony$|^chartboost$|^facebook$|^fyber$|^ironsource$|^inmobi_sdk$|^tapjoy$|^vungle$|^pangle$|^mintegral$|^ogury$|^snap$|^unity$|^verizon$|^yahoo$|^custom_native$/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`NetworkType should be one of admob_native, applovin_sdk, adcolony, chartboost, facebook, fyber, ironsource, tapjoy, vungle, pangle, mintegral, ogury, snap, unity, verizon, yahoo, custom_native. Value: <b>${value}</b>`);
				}
				break;
			case "status":
				regex = /^running$|^paused$|^archived$/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`Status should be one of running, paused or archived. <b>${value}</b>`);
				}
				break;
			case "idfaTargeting":
				regex = /^all|^only_idfa|^no_idfa/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`IDFA Targeting should be one of all, only_idfa or no_idfa. <b>${value}</b>`);
				}
				break;
			case "keywords":
				if (value == "") {
					returnValue = [];
				} else {
					let keywords = value.split(",");
					returnValue = keywords.map(word => word.trim().replace(/\s+/g, ' '));
				}
				break;
			case "includeGeoTargeting":
				regex = /^include$|^exclude$|^all$/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`GeoTargetingMode should be one of include, exclude or all. <b>${value}</b>`);
				}
				break;
			case "targetedCountries":
				if (_.isEmpty(value)) {
					throw new Error(`Countries cannot be empty when geo targeting mode is include or exclude`);
				} else {
					let result = verifyCountryCode(value.split(","));
					returnValue = result;
				}
				break;
			default:
				returnValue = value;
				break;
		}

		return returnValue;
	}

	function verifyCountryCode(countryCodes) {
		let list = {};
		for (let i=0; i < COUNTRY_LIST.length; i++) {
			list[COUNTRY_LIST[i].country_code] = COUNTRY_LIST[i].country;
		}
		let codes = [];
		for (let i=0; i < countryCodes.length; i++) {
			let countryCode = countryCodes[i].trim();
			if (!_.isEmpty(countryCode)) {
				if (countryCode.toUpperCase() in list) {
					codes.push(countryCode.toUpperCase());
				} else {
					throw new Error(`Country code <b>${countryCode}</b> is not found`);
				}
			} else {
				throw new Error(`Country code is EMPTY value. See if there is additional comma or space in the list`);
			}
		}
		return codes;
	}

	function validateOrderKey(orderKey) {
		let row = OrderTable.searchData("key", "=", orderKey);
		if (row.length == 1) {
			return orderKey;
		} else {
			throw new Error(`Invalid order key <b>${orderKey}</b> Please check entered order key exists in your account and is valid.`);
		}
	}

	function validateOrderName(orderName) {
		let row = OrderTable.searchData("name", "=", orderName);
		if (row.length >= 1) {
			return orderName;
		} else {
			throw new Error(`Invalid order name <b>${orderName}</b>. Please check entered order name exists in your account and is valid.`);
		}
	}
 
  return {
		rowParser: rowParser,
		downloadCsvAll: downloadCsvAll,
		downloadCsv: downloadCsv,
		processUpload: processUpload
  }
})(this);
