/********************************************************
 * Handles control panel events
 ********************************************************/

// Edit button 
$(".control-btn-edit").click(function() {
	let rows = WaterfallTable.getSelectedRows();
	if (!rows.length > 0) {
		toast.show(NOTIFICATIONS.zeroLineItemSelected);
		return false;
	}

	$('.ui.modal.edit-modal').modal({
		duration: 300,
		allowMultiple: true,
		closable: false,
		onApprove: function(element) {
			return editHandler();
		},
		onShow: function() {
			editFormManager.resetForm();
			// fill the form only when one line item selected
			if (rows.length == 1) {
				let rowData = rows[0].getData();
				editFormManager.fillRowInfo(rowData);
			}
		},
		onHidden: function() {
			editFormManager.resetForm();
		}
	}).modal('show');
});

// Add existing button, this will trigger the sidebar
$(".control-btn-add-existing").click(function() {
	$('.ui.sidebar').sidebar({
		"setting": {
			"transition": "overlay"
		},
		onVisible: function() {
			OrderTable.deselectRow();
			LineItemTable.clearData();
		},
		onHide: function() {
			OrderTable.deselectRow();
			LineItemTable.clearData();
		}
	}).sidebar('toggle');
});	

// X (close) button in the sidebar
$(".sidebar-close-btn").click(function() {
	$('.ui.sidebar').sidebar('hide');
});

// Import button
$(".control-btn-import").click(function() {
	$('input[type="file"]').trigger("click");
});

// Import: when uploaded
$('input[type="file"]').on('change', function() {
	let file = $(this).prop('files')[0];
	if (file == undefined) return;
	// Reset file
	$(this).val("");
	csvManager.processUpload(file);
});

// Add button
$(".control-btn-add-new").click(function() {
	$(".new-network-section").show();
	WaterfallTable.setGroupBy(false);
});

// Done in add button
$(".control-btn-close").click(function() {
	$(".new-network-section").hide();
	WaterfallTable.setGroupBy("priority");
});

// Add: adding network buttons
$(".add-network.add-item").click(function() {
	const orderKey = $(".add-item-order-list.dropdown").dropdown('get value');
	if (_.isEmpty(orderKey.trim())) {
		toast.show(NOTIFICATIONS.orderRequired);
		return false;
	}
	const type = $(this).attr("id");
	const order = orderTableController.getOrderByKey(orderKey);
	const adUnitKey = adUnitManager.getCurrentAdUnitKey();

	newLineItemFactory.add(type, order, adUnitKey);	
});

// Export button
$(".control-btn-export").click(function() {
	const selectedRows = WaterfallTable.getSelectedRows();
	$("#export-selected-box").show();
	$("#export-only-selected-count").html(selectedRows.length);

	$('.ui.modal.download-option-modal').modal({
		duration: 300,
		onHidden: function() {
			WaterfallTable.deselectRow();
		}	
	}).modal('show');
});

// Export all
$(".export-adunit-all").click(function() {
 	csvManager.downloadCsvAll();
});

// Export importable
$(".export-adunit-importable").click(function() {
 	csvManager.downloadCsv();
});

// Copy button
$(".control-btn-duplicate").click(function() {
	const rows = WaterfallTable.getSelectedRows();
	if (!rows.length > 0) {
		toast.show(NOTIFICATIONS.zeroLineItemSelected);
		return false;
	}

	$('.copy-waterfall-modal').modal({
		duration: 300,
		onApprove: function(element) {
			const formData = $('#copy-waterfall-form').serializeArray();
			const userData = copyModalController.parseInput(formData);
			const validatedUserData = copyModalController.validateUserData(userData);
			if (!validatedUserData) {
				toast.show(NOTIFICATIONS.copyFormInputError);
				return false;
			}
			copyLineItem(validatedUserData);
		},
		onHidden: function() {
			copyModalController.resetForm();
		}
	}).modal('show');
});

// Apply change button 
$(".control-btn-apply-change").click(function() {
	const numberOfChanges = lineItemStore.getTotalNumberOfChanges();
	if (numberOfChanges == 0) return;

	const lineItems = lineItemStore.getChangedLineItems();
	const html = reviewModalController.createHtml(lineItems);
	$(".review-change-table-body").html(html);
	$(".review-change-count").html(`<b>Total ${numberOfChanges} changed line item(s)</b>`);
	$('.ui.modal.review-change-modal').modal({
		duration: 300,
		onApprove: async function() {
			loaders.show("adunit");
			const results = await moPubUpdator.applyToMoPub();
			verifyMoPubUpdateResults(results);
			$(".total-change-count").html("0");
			$(".menu-adunit-dropdown").dropdown("set exactly", adUnitManager.getCurrentAdUnitKey());
			// When line items are loaded, the loader will be hidden by the waterfallTableController
			// loaders.hide("adunit");
		}
	}).modal("show");
});


/********************************************************
 * Handles API key manage events
 ********************************************************/

// API Key manage button in the menu bar (show modal)
$(".apikey-manage-btn").click(function() {
	$(".apikey-manage-modal").modal({
		duration: 300,
		onApprove: function () {
			// Reload page, we have new API key in use
			$(".mopub-logo-menu").trigger("click");
		},
		onHidden: function() {
			$(".apikey-input-segment").hide();
		}
	}).modal("show");
});

// Add button in API key modal
$(".apikey-manage-add").click(function() {
	$(".apikey-input-segment").show();
});

// Close button in API key modal
$(".apikey-add-close-btn").click(function() {
	$(".apikey-input-segment").hide();
	$(".apikey-input-form input").val("");
});

// Delete button in API key modal
$(".apikey-manage-modal").on("click", ".apikey-delete-btn", function() {
	const apiKey = $(this).closest(".item").find(".apikey-value").html();
	if (_.isEmpty(apiKey)) return;
	apiKeyManager.deleteApiKey(apiKey);
});

// Use button in API key modal
$(".apikey-manage-modal").on("click", ".apikey-use-btn", function() {
	const apiKey = $(this).closest(".item").find(".apikey-value").html();
	if (_.isEmpty(apiKey)) return;
	apiKeyManager.activateApiKey(apiKey);
});

// Add submit button in API key modal
$(".apikey-manage-submit").click(function() {
	const formData = $('.apikey-input-form').serializeArray();
	const userInput = apiKeyManager.parseInput(formData);
	if (!userInput) {
		toast.show(NOTIFICATIONS.requiredFieldMissing);
		return;
	}
	apiKeyManager.saveApiKey(userInput);
});


/********************************************************
 * Handles events in order list table
 ********************************************************/

// Load line item button
$(".load-lineitem-by-order-btn").click(async function() {
	const rowData = OrderTable.getSelectedData();
	if (rowData.length <= 0) return;

	let orderKeys = [];

	rowData.forEach(data => {
		orderKeys.push(data.key);
	});

	$(this).addClass("disabled");
	loaders.show("lineItemTable");

	await lineItemTableController.loadLineItems(orderKeys);

	loaders.hide("lineItemTable");
	$(this).removeClass("disabled");
});


/********************************************************
 * Handles events in line item list table
 ********************************************************/

// Duplicate line item button (Hmm removed for now)
// $(".lineitem-table-dup-btn").click(function() {
// 	const rowDatas = LineItemTable.getSelectedData();
// 	if (rowDatas.length <= 0) return;

// 	let duplicateTargetLineItems = [];

// 	rowDatas.forEach(rowData => {
// 		let newLineItem = copyObject(rowData);

// 		// Override ad unit
// 		newLineItem.adUnitKeys = [adUnitManager.getCurrentAdUnitKey()];

// 		// Assign temp key
// 		newLineItem.key = `temp-${stringGen(32)}`;	

// 		duplicateTargetLineItems.push(newLineItem);	
// 	});

// 	// If there is nothing to do, return
// 	if (duplicateTargetLineItems.length <= 0) return; 

// 	// Add the line item to the waterfall
// 	WaterfallTable.addData(duplicateTargetLineItems);
// });

// Assign line item button
$(".lineitem-table-assign-btn").click(async function() {
	const rowDatas = LineItemTable.getSelectedData();
	if (rowDatas.length <= 0) return;

	let targetLineItems = [];

	// See if it exists in the waterfall first
	rowDatas.forEach(rowData => {
		const searhResult = WaterfallTable.searchRows("key", "=", rowData.key);
		if (searhResult.length == 0) {
			// If it is a network line item, include only when network supports the current ad unit format
			if (rowData.type == "network") {
				const result = supportedFormatValidator.supportCurrentFormat(rowData.networkType);
				if (result) {
					targetLineItems.push(rowData);	
				} else {
					NOTIFICATIONS.assignedFailNotSupportedFormat.message = `${rowData.name} (${rowData.networkType}) does not support the current ad unit format`;
					toast.show(NOTIFICATIONS.assignedFailNotSupportedFormat);
				}
			} else {
				targetLineItems.push(rowData);	
			}
		} else {
			// Line item exists in the waterfall already
			NOTIFICATIONS.assignedAlready.message = `${rowData.name} is already assigned`;
			toast.show(NOTIFICATIONS.assignedAlready);
		}
	});

	// If there is nothing to do, return
	if (targetLineItems.length <= 0) return;

	// Update the table without triggering events (replaceData)
	let allData = WaterfallTable.getData();
	allData.push(...targetLineItems);
	await WaterfallTable.replaceData(allData);
	LineItemTable.deselectRow();

	// Notify
	NOTIFICATIONS.assignSuccess.message = `${targetLineItems.length} line items were successfully assigned`;
	toast.show(NOTIFICATIONS.assignSuccess);

	// Save in the store. Pretend like it was existed in the first place
	lineItemStore.saveLineItems(targetLineItems);

	// Then assign ad unit key
	targetLineItems.forEach(lineItem => {
		const newLineItem = copyObject(lineItem);
		newLineItem.adUnitKeys.push(adUnitManager.getCurrentAdUnitKey());
		WaterfallTable.updateData([newLineItem]);
	});
});


/********************************************************
 * Handles search and sort buttons 
 ********************************************************/
 
// Redraw table
$("#colsize-reset").click(function() {
	WaterfallTable.redraw(true);
});

// Reset sorting button
$("#sort-reset").click(function() {
	waterfallTableController.resetSorting();
});

// Save columns
$("#save-columns").click(function() {
	const currentValues = $(".column-selector").dropdown("get value");
	let columns = [];
	for (const col of	currentValues) {
		if (col instanceof Array) {
			columns = (col);
			break;
		}
	}
	chrome.storage.local.set({columnList: columns}, function() {
		toast.show(NOTIFICATIONS.columnListSaved);
		console.log(`Column list saved: ${columns}`);
	});
});

// Search
$("#waterfall-search, #order-search, #line-item-search").keyup(function() {
	const searchInPutId = $(this).attr("id");
	const searchText = $(this).val().trim();
	let table, filterTargetColumns;

	switch(searchInPutId) {
		case "waterfall-search":
			table = WaterfallTable;
			filterTargetColumns = tableColumnDef.getFilterTargetColsDef("WaterfallTable", searchText);
			break;
		case "line-item-search":
			table = LineItemTable;
			filterTargetColumns = tableColumnDef.getFilterTargetColsDef("LineItemTable", searchText);
			break;
		case "order-search":
			table = OrderTable;
			filterTargetColumns = tableColumnDef.getFilterTargetColsDef("OrderTable", searchText);
			break;
		default:
			table = WaterfallTable;
			filterTargetColumns = tableColumnDef.getFilterTargetColsDef("WaterfallTable", searchText);
			break;
	}

	// Apply filter
	let currentFilters = table.getFilters();
	let keepFilters = [];
	if (!_.isEmpty(searchText)) {
		for (let i=0; i < currentFilters.length; i++) {
			if(!_.isArray(currentFilters[i])) {
				keepFilters.push(currentFilters[i]);
			}
		}
		keepFilters.push(filterTargetColumns);
		table.setFilter(keepFilters);
	} else {
		for (let i=0; i < currentFilters.length; i++) {
			if(!_.isArray(currentFilters[i])) {
				// Remove OR filters and keep AND filters
				keepFilters.push(currentFilters[i]);
			}
		}
		(keepFilters.length == 0) ? table.clearFilter(true) : table.setFilter(keepFilters);
	}
});


/********************************************************
 * Handles country preset related
 ********************************************************/

// Save country preset button
$(".edit-modal-save-country-preset").modal({
	allowMultiple: true,
	closable: false,
	duration: 300,
	onApprove: function() {
		const input = $('.new-country-preset-form').serializeArray();
		if (_.isEmpty(input)) return;
	
		let name = "";
		input.forEach(each => {
			if (each.name == "new-country-preset-name") name = each.value.trim();
		});

		if (_.isEmpty(name)) {
			toast.show(NOTIFICATIONS.countryPresetSaveEmptyName);
			return false;
		}

		const currentInput = $("#target-country").dropdown('get value');
		const countryCodeList = currentInput.split(",");

		countryPresetController.createCountryPreset(name, countryCodeList).then(result => {
			toast.show(NOTIFICATIONS.countryPresetSaveSuccess);
			$(".edit-modal-save-country-preset").modal("hide");
		}).catch(error => {
			try {
				const mopubErrMsg = JSON.parse(error.responseText);
				for (error of mopubErrMsg.errors) {
					NOTIFICATIONS.countryPresetSaveFailed.message = error.message;
					toast.show(NOTIFICATIONS.countryPresetSaveFailed);
					break; // Show only the first one
				}
			} catch (error) {
				toast.show(NOTIFICATIONS.countryPresetSaveFailedGeneric);
			}
		});

		return false;
	},
	onHidden: function() {
		countryPresetController.clear();
	}
});

// Load country preset button
$(".edit-modal-load-country-preset").modal({
	allowMultiple: true,
	closable: false,
	duration: 300,
	onShow: async function() {
		try {
			loaders.show("countryPresetModal");
			await countryPresetController.load();
			loaders.hide("countryPresetModal");
		} catch(error)  {
			// Error
		}
	},
	onHidden: function() {
		countryPresetController.clear();
	}
});

// Preset load button
$(".edit-modal-load-country-preset").on("click", ".country-preset-load", function() {
	const presetKey = $(this).closest("tr").find("input.country-preset-list").attr("key");
	if (_.isEmpty(presetKey)) return;

	const countryCodes = countryPresetController.getCountryCodesByPresetKey(presetKey);
	if (!_.isEmpty(countryCodes)) {
		$("#target-country").dropdown('set exactly', countryCodes);	
	}

	$(".edit-modal-load-country-preset").modal("hide");
});

// Preset delete button
$(".edit-modal-load-country-preset").on("click", ".country-preset-delete", async function() {
	const tr = $(this).closest("tr");
	const presetKey = tr.find("input.country-preset-list").attr("key");
	if (_.isEmpty(presetKey)) return;

	try {
		// tr.remove();
		loaders.show("countryPresetModal");
		await countryPresetController.deleteCountryPreset(presetKey);
		await countryPresetController.load();
		loaders.hide("countryPresetModal");
		toast.show(NOTIFICATIONS.countryPresetDeleteSuccess);
	} catch(error) {
		toast.show(NOTIFICATIONS.countryPresetDeleteFailed);
	}
});

// Connect country prest modal to edit modal
$(".edit-modal-save-country-preset").modal('attach events', '.ui.modal.edit-modal .country-save-preset');
$(".edit-modal-load-country-preset").modal('attach events', '.ui.modal.edit-modal .country-load-preset');


/********************************************************
 * QRCode
 ********************************************************/

$(".qrcode-wrapper").click(function() {
	$(".qrcode-modal").modal({
		duration: 300,
		onShow: function() {
			infoPanelManager.qrCodeGenForModal(adUnitManager.getCurrentAdUnit());
		}
	}).modal("show");
});


/********************************************************
 * Notification dialog dismiss and update result modal
 ********************************************************/

$(".notification-box").on("click", ".message .close", function() {
  $(this).closest(".message").hide();
	$(this).siblings(".header").html("");
	$(this).siblings(".content").html("");
	// Clear existing notification
	notifier.clear();
});

$("#notification").on('click', ".mopub-update-results", function() {
	$('.update-result-modal').modal({
		onHidden: function() {
			$(".update-result-modal .content").html("");
		}
	}).modal("show");
});


/********************************************************
 * Handlers 
 ********************************************************/

function editHandler() {
	const formData = $('#edit-form').serializeArray();
	const userData = editFormManager.parseInput(formData);

	// For debug
	console.log("Edit form user input");
	console.log(userData);

	// Validate country targeting inputs
	if ("targetMode" in userData && "targetCountries" in userData) {
		if (userData.targetMode != "all" && _.isEmpty(userData.targetCountries)) {
			$("#target-country").closest('.field').addClass('error');
			console.log("User did not select countries");
			return false;
		}
	}

	// All data is ready let's update
	let selectedRowData = WaterfallTable.getSelectedData();

	selectedRowData.forEach(row => {
		if ("bid" in userData) row.bid = userData.bid;
		if ("status" in userData) row.status = userData.status;
		if ("priority" in userData && row.type != "marketplace") {
			row.priority = userData.priority;
		}
		if ("targetMode" in userData && row.type != "marketplace") {
			row.includeGeoTargeting = userData.targetMode;
			row.targetedCountries = userData.targetCountries;
		}
		if ("keywords" in userData && row.type != "marketplace") {
			row.keywords = userData.keywords;
		}
		if ("disallowAutoCpm" in userData && row.type == "network") {
			row.disallowAutoCpm = userData.disallowAutoCpm;
		}
		if ("adUnitKeys" in userData && row.type != "marketplace") {
			row.adUnitKeys = userData.adUnitKeys;
		}
		// Update IDFA targeting
		// if ("idfaTargeting" in userData) row.idfaTargeting = userData.idfaTargeting;
	});

	WaterfallTable.blockRedraw();
	WaterfallTable.deselectRow();
	const selectedRows = WaterfallTable.getSelectedRows();
	WaterfallTable.updateData(selectedRowData).then(function() {
		selectedRows.forEach(row => { row.reformat(); });
	});
	WaterfallTable.restoreRedraw();
}

function verifyMoPubUpdateResults(results) {
	let successCount = 0;
	let failCount = 0;
	let failResults = [];

	results.forEach(result => {
		if (result.status == "fulfilled") {
			successCount += 1;
			// Success. MoPub will respond with the line item object.
			const updatedLineItem = result.value.mopubResponse.data;
			const updateLineItemKey = result.value.lineItemKey;
		} else if (result.status == "rejected") {
			failCount += 1;
			// Failed
			const statusCode = result.reason.error.statusCode;
			const moPubResponseTxt = result.reason.error.responseText;
			const failedLineItemKey = result.reason.lineItemKey;

			// Save result
			try {
				failResults.push({
					"lineItemKey": failedLineItemKey,
					"response": JSON.parse(moPubResponseTxt)
				});
			} catch (e) {
				failResults.push({
					"lineItemKey": failedLineItemKey,
					"response": moPubResponseTxt
				});
			}
		}
	});

	if (successCount == results.length) {
		const msg = `${successCount} line items were updated`;	
		NOTIFICATIONS.moPubUpdateSucess.message = msg;
		notifier.show(NOTIFICATIONS.moPubUpdateSucess);
	} else if (failCount != 0) {
		let msg = `Out of ${results.length}, ${failCount} line items update failed.`;	
		msg += ` Click <span class="mopub-update-results">here</span> for more details.`;
		NOTIFICATIONS.moPubUpdateFail.message = msg;
		notifier.show(NOTIFICATIONS.moPubUpdateFail);
		updateResultModalContent(failResults);
	}
}

function updateResultModalContent(results) {
	if (results.length <= 0) return;
	const prettyStr = JSON.stringify(results, null, 2);
	const html = `<pre class="mopub-update-result-pre">${prettyStr}</pre>`;
	$(".update-result-modal .content").html(html);
}

async function copyLineItem(validatedUserData) {
	const rowDatas = WaterfallTable.getSelectedData();
	const targetAdUnit = adUnitManager.getAdUnit(validatedUserData.adUnitKey);
	
	// Validate if target ad unit format is supported by each line item
	let sourceLineItems = [];
	for (const lineItem of rowDatas) {
		if (lineItem.type != "network") {
			sourceLineItems.push(lineItem);
			continue;
		}
		const result = supportedFormatValidator.isFormatSupportedByNetwork(lineItem.networkType, targetAdUnit.format);
		if (result) sourceLineItems.push(lineItem);
	}

	// If there is no line items to copy
	if (sourceLineItems.length == 0) {
		toast.show(NOTIFICATIONS.copyZeroLineItem);
		return;
	}

	loaders.show("adunit");

	try {
		await lineItemCopyManager.copy(sourceLineItems, validatedUserData);
		let msg = `${sourceLineItems.length} line items were copied.`;
		msg += ` See <a href="${ADUNIT_PAGE_URL+targetAdUnit.key}" target="_blank">${targetAdUnit.name}</a> to verify the result.`
		NOTIFICATIONS.copyLineItemSuccess.message = msg;
		notifier.show(NOTIFICATIONS.copyLineItemSuccess);
	} catch (error) {
		let msg = `There was an error copying line items.`;	
		msg += ` Click <span class="mopub-update-results">here</span> for more details.`
		showErrorMsgWithDetails(error);
		NOTIFICATIONS.copyLineItemFail.message = msg;
		notifier.show(NOTIFICATIONS.copyLineItemFail);
	}

	WaterfallTable.deselectRow();
	loaders.hide("adunit");
}

/**
 * Use this only if API returns error message in { error: server_response, lineItemKey: "" }
 * Mostly for post APIs. This is to show entire error messages.
 * [To-do] Entire logic for showing error message should be changed :-(
 */
function showErrorMsgWithDetails(errorObj, msg) {
	let errorMessages = [];

	try {
		errorMessages.push({
			"lineItemKey": errorObj.lineItemKey,
			"response": JSON.parse(errorObj.error.responseText)
		});
	} catch (e) {
		errorMessages.push({
			"lineItemKey": errorObj.lineItemKey,
			"response": errorObj.error.responseText
		});
	}

	updateResultModalContent(errorMessages);
}
