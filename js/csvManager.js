var csvManager = (function(global) {
	"use strict";

	let colNames = [
		"Name (Required)",
		"Line Item Key (Required. Leave EMPTY if new)",
		"Order Key (Only required for new line items)",
		"Priority (Required. Enter between 1 ~ 16)",
		"CPM (Required)",
		"Type (Required)",
		"Network Type (Required for Network)",
		"Network Account Id (Based on network)",
		"Network AdUnit Id (Based on network)",
		"Network App Id (Based on network)",
		"Network App Signature (Chartboost only)",
		"Network Location (Chartboost only)",
		"Custom Event ClassName (Custom network only)",
		"Custom Event ClassData (Custom network only)",
		"Status (Required)",
		"Keywords (Optional. Comma separated)",
		"GeoTargetingMode(Required. If 'all', countires will be ignored)",
		"Countries (Optional. Comma separated)"
	];

	function downloadCsv(option, callback) {
		if (option == "all") {
			let filename = `${AdUnitId}_${getCurrentTimeInEpoch()}.csv`;
			WaterfallTable.download("csv", filename);
			return true; 
		} else if (option == "importable") {
			let exportImportableData = [];
			let allData = WaterfallTable.getData('active');
			for(let i=0; i < allData.length; i++) {
				let eachLineItem = allData[i];

				// Skip marketplace, advanced_bidding, custom JS network(custom_html) and status that is NOT running/paused/archived from exporting
				let statusRegex = /^running$|^paused$|^archived$/;
				let typeRegex = /^marketplace$|^advanced_bidding_mpx$|^advanced_bidding_network$|^pmp_line_item$|^segment$/;
				if (!statusRegex.test(eachLineItem.status)) continue;
				if (typeRegex.test(eachLineItem.type)) continue;
				if (eachLineItem.networkType == "custom_html") continue;
				exportImportableData.push({
					[colNames[0]]: eachLineItem.name,
					[colNames[1]]: eachLineItem.key,
					[colNames[2]]: "",
					[colNames[3]]: eachLineItem.priority,
					[colNames[4]]: eachLineItem.bid,
					[colNames[5]]: eachLineItem.type,
					[colNames[6]]: eachLineItem.networkType,
					[colNames[7]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_account_id,
					[colNames[8]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_adunit_id,
					[colNames[9]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.network_app_id,
					[colNames[10]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.app_signature,
					[colNames[11]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.location,
					[colNames[12]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.custom_event_class_name,
					[colNames[13]]: (_.isEmpty(eachLineItem.overrideFields)) ? '' : eachLineItem.overrideFields.custom_event_class_data,
					[colNames[14]]: eachLineItem.status,
					[colNames[15]]: eachLineItem.keywords,
					[colNames[16]]: eachLineItem.includeGeoTargeting,
					[colNames[17]]: eachLineItem.targetedCountries
				});
			}
			let exportCsv = Papa.unparse(exportImportableData);
			let hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(exportCsv);
			hiddenElement.target = '_blank';
			hiddenElement.download = `Importable_${AdUnitId}_${getCurrentTimeInEpoch()}.csv`;
			hiddenElement.click();
		}
		callback();
	}

	function processUpload(file, callback) {
		Papa.parse(file, {
			config: {
				comments: true,
				skipEmptyLines: true
			},
			complete: function(results) {
				// Check if it is importable format, see if title matches
				for (let i=0; i < results.data[0].length; i++) {
					if (results.data[0][i] != colNames[i]) {
						notifier.show({
							header: "Import Unsccessful",
							type: "negative",
							message: `Please check if uploaded file is in importable format. Column name "${colNames[i]}" does not match.`
						});
						callback();
						return false;
					}
				}
				// Parse
				let parsedDataList = csvManager.rowParser(results.data);

				// Import
				if (parsedDataList) {
					WaterfallTable.updateOrAddData(parsedDataList).then(function(rows) {
						notifier.clear();
						notifier.show({
							header: "Import Successful",
							type: "success",
							message: `${parsedDataList.length} lineitems were imported successfully.`
						});
						callback();
					}).catch(function(error) {
						callback();
						console.log(error.message);
					});
				} else {
					callback();
				}
			}
		});
	}

	function rowParser(data) {
		let uploadData = [];
		let rowObj = {};

		// i=0 is title row
		for (let i=1; i < data.length; i++) {
			let [name, key, orderKey, priority, bid, type, networkType, 
				networkAccountId, networkAdUnitId, networkAppId, networkAppSignature, networkLocation,
				customEventClassName, customEventClassData, status, keywords, geoMode, countries] = data[i];

			let overrideFields = {
				'network_account_id': networkAccountId.toString().trim(),
				'network_adunit_id': networkAdUnitId.toString().trim(),
				'network_app_id': networkAppId.toString().trim(),
				'app_signature': networkAppSignature.toString().trim(),
				'location': networkLocation.toString().trim(),
				'custom_event_class_name': customEventClassName.toString().trim(),
				'custom_event_class_data': customEventClassData.toString().trim()
			};

			try {
				rowObj = {
					'name': csvFieldValidator('name', name),
					'key': (key.toString().trim() == "") ? null : csvFieldValidator('key', key),
					'orderKey': (orderKey.toString().trim() == "") ? null : csvFieldValidator('orderKey', orderKey), 
					'priority': csvFieldValidator('priority', priority),
					'bid': csvFieldValidator('bid', bid),
					'type': csvFieldValidator('type', type),
					'networkType': (type == "network") ? csvFieldValidator('networkType', networkType) : null,
					'overrideFields': (type == "network") ? overrideFieldValidator.validate(networkType, overrideFields) : undefined,
					'status': csvFieldValidator('status', status),
					'keywords': csvFieldValidator('keywords', keywords),
					'includeGeoTargeting': csvFieldValidator('includeGeoTargeting', geoMode),
					'targetedCountries': (geoMode == "all") ? [] : csvFieldValidator('targetedCountries', countries),
				};
		
				// Validate if it is new or old.
				if (_.isEmpty(rowObj.key)) {
					// New line item. It should have order key, otherwise throw error.
					if (_.isEmpty(rowObj.orderKey)) {
						throw new Error(`New line item <b>${rowObj.name}</b> requires order key.`);
					}
				} else {
					// Existing line item. It should NOT have order key. otherwise throw error.
					if (!_.isEmpty(rowObj.orderKey)) {
						throw new Error(`Line item(<b>${rowObj.name}</b>)'s order cannot be updated. Remove order key <b>${rowObj.orderKey}</b> to update.`);
					}
				}

				// Assign temp id for new line item
				rowObj.key = (_.isEmpty(rowObj.key)) ? `temp-${stringGen(32)}` : rowObj.key;

				// Data ready, save.
				uploadData.push(rowObj);
			} catch(error) {
				notifier.show({
					header: "Import Validation Error",
					type: "negative",
					message: `[Line ${i+1}] ${error}`
				});
				return false;
			}

			// Temp
			console.log('Row Parsed');
			console.log(rowObj);
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
			case "orderKey":
				regex = /^[0-9|a-z]{32}$/;
				if (regex.test(value)) {
					returnValue = value;
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
				regex = /^admob_native$|^applovin_sdk$|^adcolony$|^chartboost$|^facebook$|^ironsource$|^tapjoy$|^vungle$|^custom_html$|^custom_native$/i;
				if (regex.test(value)) {
					returnValue = value.toLowerCase();
				} else {
					throw new Error(`NetworkType should be one of admob_native, applovin_sdk, adcolony, chartboost, facebook, ironsource, tapjoy, vungle, custom_native. <b>${value}</b>`);
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
			if (countryCodes[i].trim() in list) {
				codes.push(countryCodes[i].trim().toUpperCase());
			} else {
				throw new Error(`Country code ${countryCodes[i].trim()} is not found`);
			}
		}
		return codes;
	}
 
  return {
		rowParser: rowParser,
		downloadCsv: downloadCsv,
		processUpload: processUpload
  }
})(this);
