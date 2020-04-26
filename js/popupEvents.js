// Remove flash after animation
$("#waterfall-adunit").on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
	$(".flash").removeClass('flash badge update-badge new-badge');
});

// Notification Dismiss
$('#notification,	#edit-form-notification, #copy-form-notification, #edit-network-form-notification').on('click', '.message .close', function() {
  $(this).closest('.message').hide();
	$(this).siblings('.header').html('');
	$(this).siblings('.content').html('');
});

// Show and Hide lineitem button
$("#add-adsource").click(function() {
	if($("#adsource-section").is(":hidden")) {
		$('#waterfall-adunit').parents('#waterfall-section').removeClass().addClass('nine wide column');
		$('#adsource-section').show();
		WaterfallTable.redraw();
		LineItemTable.redraw();
		OrderTable.redraw();
	} else {
		$('#adsource-section').hide();
		$('#waterfall-adunit').parents('#waterfall-section').removeClass().addClass('sixteen wide column');	
		WaterfallTable.redraw();
		LineItemTable.redraw();
		OrderTable.redraw();
	}
});	

$("#reload-ad-unit").click(function() {
	notifier.clear();
	loadWaterfall(AdUnitId, function() {
		// Hmm.. do nothing for now
	});
});

/* Select all checkbox */
$(".all-content-wrapper").on("change", ".select-all", function() {
	let selected = $(this).is(":checked");
	let table = $(this).attr("table");
	let tableMapping = {
		waterfall: WaterfallTable,
		order: OrderTable,
		lineitem: LineItemTable
	}
	let filteredRows = [];
	let rows = tableMapping[table].getRows('active'); 
	for (let i=0; i < rows.length; i++) {
		let rowElement = rows[i].getElement();
		if ($(rowElement).hasClass('tabulator-unselectable')) continue;
		filteredRows.push(rows[i]);
	}
	if (selected) {
		for (let i=0; i < filteredRows.length; i++) {
			filteredRows[i].select();
		}
	} else {
		for (let i=0; i < filteredRows.length; i++) {
			filteredRows[i].deselect();
		}
	}
});

// Download CSV Button
$("#waterfall-download-csv").click(function() {
	let selectedRows = WaterfallTable.getSelectedRows();
	if (selectedRows.length > 0) {
		$("#export-selected-box").show();
		$("#export-only-selected-count").html(`(${selectedRows.length} items selected)`);
	} else {
		$("#export-selected-box").hide();
		$("#export-only-selected-count").html('');
	}
	$('.ui.modal.download-option-modal').modal('show');
});

$(".download-button").click(function() {
	csvManager.downloadCsv($(this).attr("option"), function() {
		$('.ui.modal.download-option-modal').modal('hide');
	});
});

// Edit selected line items
$("#edit-selected").click(function() {
	let rows = WaterfallTable.getSelectedRows();
	if (!rows.length > 0) return false;
	editFormManager.resetForm();
	$('.ui.modal.edit-modal').modal({
		duration: 300,
		onShow: function() {
			// fill the form only when one line item selected
			if (rows.length == 1) {
				let rowData = rows[0].getData();
				editFormManager.fillRowInfo(rowData);
			}
		}
	}).modal('show');
});

// Delete selected lint items
$("#delete-selected").click(function() {
	let rows = WaterfallTable.getSelectedRows();
	if (!rows.length > 0) return false;

	let numberOfItemsToDelete = rows.length;

	// Show loaders
	loadingIndicator.setTotalBarLoader(numberOfItemsToDelete);
	loadingIndicator.showBarLoader();
	$(".updating-message").html(`Deleting(deassign) line items, remaining ${numberOfItemsToDelete}`);
	$(".all-content-wrapper").dimmer("show");

	// Lock table
	WaterfallTable.blockRedraw();

	let orgLineItems = lineItemManager.getOrgLineItems();

	for (let i=0; i < rows.length; i++) {
		let rowData = rows[i].getData();
		if (rowData.key in orgLineItems) {
			// Existing line item, get line item details from MoPub UI and update orgLineItem.
			// Existing line item doesn't have adunitkeys field
			lineItemManager.getLineItemFromMoPub(rowData.key, function(lineItem) {

				loadingIndicator.increaseBar();
				numberOfItemsToDelete--;
				$(".updating-message").html(`Deleting(deassign) line items, remaining ${numberOfItemsToDelete}`);

				if (lineItem) {
					// See if the current ad unit is only one assigned which can't be deassigned. archive instead
					if (lineItem.adUnitKeys.length == 1) {
						rows[i].update({status: "archived"});
						notifier.show({
							header: "Line item requires at least on ad unit assigned",
							message: `<b>${lineItem.name}</b> <b>(${lineItem.key})</b> cannot be deleted. It requires at least one ad unit assigned. Archived the line item instead.`,
							type: "info",
							append: true
						});
					} else {
						// line item has multiple ad unit assigned. remove from table for now. Later when submit, this will be show as deleted in changes.
						// In order to show up as deleted, orgLineItems should be updated, especially adunitkeys field.
						lineItemManager.cacheLineItem([lineItem]);
						rows[i].delete();	
					}
				}
				if (numberOfItemsToDelete == 0) {
					// Remove loading screen
					$(".all-content-wrapper").dimmer("hide");
					loadingIndicator.hideBarLoader();
					WaterfallTable.restoreRedraw();
				}
			});
		} else {
			// Newly added line item, just remove the row!
			numberOfItemsToDelete--;
			rows[i].delete();
			loadingIndicator.increaseBar();
			$(".updating-message").html(`Deleting(deassign) line items, remaining ${numberOfItemsToDelete}`);
		}
	}
	if (numberOfItemsToDelete == 0) {
		// Remove loading screen
		$(".all-content-wrapper").dimmer("hide");
		loadingIndicator.hideBarLoader();
		WaterfallTable.restoreRedraw();
	}
	// Release checkboxes
	WaterfallTable.deselectRow(rows);
	releaseCheckBox(rows);
});


// Edit Submit button
$("#edit-submit").click(function() {
	let formData = $('#edit-form').serializeArray();
	let input = editFormManager.parseInput(formData);
	let subBtn = $(this);

	// Temp
	console.log("Edit form user input");
	console.log(input);

	// Validate country targeting inputs
	if (input.targetMode != "all" && !_.isEmpty(input.targetMode) && _.isEmpty(input.targetCountries)) {
		$("#target-country").closest('.field').addClass('error');
		console.log("User did not select countries");
		return false;
	}

	// All data is ready let's update
	let selectedRowData = WaterfallTable.getSelectedData();
	for (let i=0; i < selectedRowData.length; i++) {
		let lineItem = selectedRowData[i];
		// Update each lineItem
		if (input.cpm > 0) {
			lineItem.bid = input.cpm;
		}
		if (!_.isEmpty(input.status)) lineItem.status = input.status;
		// Do not update marketplace
		if (!_.isEmpty(input.priority) && lineItem.type != "marketplace") {
			lineItem.priority = parseInt(input.priority);
		}
		// Update geo targeting
		if (!_.isEmpty(input.targetMode) && lineItem.type != "marketplace") {
			lineItem.includeGeoTargeting = input.targetMode;
			lineItem.targetedCountries = (input.targetMode == "all") ? [] : (input.targetCountries).split(",").sort();
		}
		// Update keyword targeting
		if (!_.isEmpty(input.keywords) && lineItem.type != "marketplace") {
			lineItem.keywords = (input.keywords).split(",");
		}
		// Update disallowAutoCpm (only network type)
		if (!_.isEmpty(input.disallowAutoCpm.toString()) && lineItem.type == "network") {
			lineItem.disallowAutoCpm = input.disallowAutoCpm;
		} else if (_.isEmpty(input.disallowAutoCpm.toString())) {
			delete lineItem.disallowAutoCpm;
		}
	}

	let selectedRowObj = WaterfallTable.getSelectedRows();

	// Lock Table
	WaterfallTable.blockRedraw();
	afterUpdate = function() {
		WaterfallTable.deselectRow();
		WaterfallTable.restoreRedraw();
		releaseCheckBox(selectedRowObj);
		$('.ui.modal.edit-modal').modal('hide');
		editFormManager.resetForm(); // Reset the form
		subBtn.removeClass("loading disabled");
	};
	
	subBtn.addClass("loading disabled");
	setTimeout(function() { 
		WaterfallTable.updateData(selectedRowData).then(function(rows) {
			console.log("Updated WaterfallTable");
			afterUpdate();
		}).catch(function(error) {
			console.log(`Update failed - ${error.message}`);
			afterUpdate();
		});
	}, 10);
});

$("#copy-waterfall").click(function() {
	// Reset form first
	$("#copy-only-selected").prop('checked', false);
	$("#copy-only-selected-count").html("");
	$(".copy-mode-dropdown").dropdown('restore default value');
	$(".copy-form-order-list").dropdown('clear');
	$(".adunit-select-copy-form").dropdown('clear');
	notifier.clearCopyForm();
	
	// If there was selected line items, check selected checkbox
	let selectedRows = WaterfallTable.getSelectedRows();
	if (selectedRows.length > 0) {
		$("#copy-only-selected").prop('checked', true);
		$("#copy-only-selected-count").html(`(${selectedRows.length} items selected)`);
	}

	$('.ui.modal.copy-waterfall-modal').modal('show');
});

$("#copy-submit").click(function() {
	let copyMode = $('#copy-mode').val();
	let copyOnlySelected = $('#copy-only-selected').is(':checked');
	let selectedValues = $('.adunit-select-copy-form').dropdown('get value');
	let lineItems = (copyOnlySelected) ? WaterfallTable.getSelectedData() : WaterfallTable.getData();
	let selectedOrderKey = $(".copy-form-order-list").dropdown("get value");
	let selectedOrderName = $(".copy-form-order-list").dropdown("get text");
	let selectedRows = WaterfallTable.getSelectedRows();

	// Validate Inputs
	if (copyOnlySelected && selectedRows.length <= 0) {
		notifier.copyFormShow({header: "Input Validation Error", message: "There are no selected line items. Select line items first or uncheck duplicate only selected line items.", type: "negative"});
		console.log("No selected line items but duplicate only selected line items option was on");
		return false;
	}

	let keyRegex = /^[0-9|a-z]{32}$/;
	if (!keyRegex.test(selectedValues)) {
		notifier.copyFormShow({header: "Input Validation Error", message: "Target ad unit was not selected. Please select target ad unit.", type: "negative"});
		console.log("No ad unit was selected");
		return false;
	}

	if (copyMode == "in_one_existing_order" && _.isEmpty(selectedOrderKey.trim())) {
		notifier.copyFormShow({header: "Input Validation Error", message: "Please select Order for line items", type: "negative"});
		console.log("Order is not selected");
		return false;
	}

	$('.ui.modal.copy-waterfall-modal').modal('hide');

	let adUnitIds = [selectedValues];
	let selectedOrderInfo = { orderKey: selectedOrderKey, orderName: selectedOrderName };
	waterfallDuplicator.duplicate(adUnitIds, lineItems, copyMode, selectedOrderInfo, function() {
		$(".all-content-wrapper").dimmer("hide");
		chrome.runtime.sendMessage({
			type: "chromeNotification", 
			title: "Duplicate Completed", 
			message: "Click here to load the duplicated ad unit in MoPub UI",
			id: "adUnitId-" + adUnitIds[0]
		});
		loadWaterfall(AdUnitId, function() {
			// Hmm.. do nothing for now
			// Should I just release checkboxes. (once copy object then should update)
		});
	});
});

// Apply to MoPub
$("#apply-waterfall").click(function() {
	scrollToTop();
	let lineItemChanges = lineItemManager.getLineItemChanges();
	let refinedChanges = moPubUI.refineChanges(lineItemChanges);
	if (_.keys(refinedChanges).length == 0) {
		notifier.show({
			header: "Waterfall Unchanged",
			type: "info",
			message: "There is no update."
		});
		return false;
	}
	// Modal
	let html = reviewChange.createHtml(refinedChanges);
	$("#change-table-body").html(html);
	$("#change-table-count").html(`<b>Total ${_.keys(refinedChanges).length} changed line items</b>`);
	$('.ui.modal.review-change-modal').modal('show');
});

$("#review-submit").click(function() {
	$('.ui.modal.review-change-modal').modal({
		onApprove: function() {
			scrollToTop();
			let lineItemChanges = lineItemManager.getLineItemChanges();
			moPubUI.updateWaterfall(lineItemChanges, function(result) {
				$(".all-content-wrapper").dimmer("hide");
				chrome.runtime.sendMessage({
					type: "chromeNotification", 
					title: "Update Completed", 
					message: "Click here to load the ad unit in MoPub UI",
					id: "adUnitId-" + AdUnitId
				});
				loadWaterfall(AdUnitId, function() {
					// do something
				});
			});	
		}
	}).modal('hide');
});

$("#review-cancel").click(function() {
	$('.ui.modal.review-change-modal').modal('hide');
});

// Assign or Duplicate LineItems
$(".lineitem-action-buttons").click(function() {
	let rowDatas = LineItemTable.getSelectedData();
	if (_.isEmpty(rowDatas)) return;

	let button = $(this);
	button.addClass("loading disabled");
	let action = button.attr("action");
	notifier.clear();

	let deleteRowIndex = [];
	let existingItems = [];

	for (let i=0; i < rowDatas.length; i++) {
		let data = rowDatas[i];
		if (action == "assign") {
			// See if it already exists in the waterfall
			let searhResult = WaterfallTable.searchRows("key", "=", data.key);
			if (searhResult.length > 0) {
				notifier.show({
					message: `<span class="update-fail-lineitem">Name: <b>${data.name}</b> Key: <b>${data.key}</b> already exists. It was not added.</span>`,
					append: true
				});
				existingItems.push(data);
				continue;
			}	
			if (!data.adUnitKeys.includes(AdUnitId)) { 
				// [Important] Update orgLineItems without new assigning ad unit id first
				// so the assigned line item can be considered as updated item
				lineItemManager.cacheLineItem([data]);

			  // Assign new AdUnit Id - this should happen after updating the orgLineItem
				data.adUnitKeys.push(AdUnitId);

				// Add to the delete list (for line item table)
				deleteRowIndex.push(data.key);

				console.log(`Assigning adunit ${AdUnitId} for ${data.key}`);
			}
		} else if (action == "duplicate") {
			data.adUnitKeys = [AdUnitId];
			data.key = "temp-" + stringGen(32);
			data.name += " (Duplicated)";
			console.log(`Duplicating ${data.key}`);
			deleteRowIndex.push(data.key);
		}
	}

	let selectedRowObj = LineItemTable.getSelectedRows();

	loadingIndicator.setTotalBarLoader(rowDatas.length);
	loadingIndicator.showBarLoader();
	WaterfallTable.blockRedraw();
	LineItemTable.blockRedraw();

	let afterUpdate = function() {
		WaterfallTable.restoreRedraw();
		LineItemTable.restoreRedraw();
		loadingIndicator.hideBarLoader();
		button.removeClass("loading disabled");
		$("#status-filter").trigger('change');
		LineItemTable.deselectRow();
    releaseCheckBox(selectedRowObj);
		// sortByBidPriority(WaterfallTable);
	};

	// Remove existing data out of updating list
	_.pullAll(rowDatas, existingItems);	

	// Give it a short delay
	if (rowDatas.length > 0) {
		setTimeout(function() { 
			WaterfallTable.updateOrAddData(rowDatas).then(function(rows) {
				LineItemTable.deleteRow(deleteRowIndex).then(function() {
					afterUpdate();
				});
			}).catch(function(error) {
				afterUpdate();
				console.log(error.message);
			});
		}, 200);
	} else {
		afterUpdate();
	}
});


// Load Lineitem Button
$("#load-lineitem-btn").click(function() {
	let buttonObj = $(this);

	// let rowData = tableInitializer.selectedOrders();
	let rowData = OrderTable.getSelectedData();
	let orderKeys = [];

	for (let i=0 ; i < rowData.length; i++) {
		orderKeys.push(rowData[i].key); 
	}

	if (orderKeys.length > 0) {
		$("#loader-lineitem-table").dimmer("show");
		buttonObj.addClass('loading disabled');
		LineItemTable.clearData();
		LineItemTable.blockRedraw();
		let selectedRowObj = OrderTable.getSelectedRows();

		loadLineItemsByOrder(orderKeys, function() {
			OrderTable.deselectRow();
			releaseCheckBox(selectedRowObj);
			$("#loader-lineitem-table").dimmer("hide");
			buttonObj.removeClass('loading disabled');
			LineItemTable.restoreRedraw();
			LineItemTable.setFilter(LineItemTable.getFilters()); // Apply filter again!
			LineItemTable.setSort([
				{ column:"orderName", dir:"desc" }
			]);
		});
	}
});

// Search Inputs
$("#adsource-section, #waterfall-section").on("keyup", "#waterfall-search, #order-search, #line-item-search", function() {
	let searchInPutId = $(this).attr('id');
	let value = $(this).val().trim();

	let table;
	let filterTargetColumns;

	switch(searchInPutId) {
		case "waterfall-search":
			table = WaterfallTable;
			filterTargetColumns = [
				{ field: "name", type: "like", value },
				{ field: "key", type: "like", value },
				{ field: "type", type: "like", value },
				{ field: "networkType", type: "like", value },
				{ field: "status", type: "like", value },
				{ field: "overrideFields", type: "like", value },
				{ field: "includeGeoTargeting", type: "like", value },
				{ field: "targetedCountries", type: "like", value },
				{ field: "targetedRegions", type: "like", value },
				{ field: "targetedCities", type: "like", value },
				{ field: "targetedZipCodes", type: "like", value },
				{ field: "keywords", type: "like", value },
				{ field: "bid", type: "like", value },
				{ field: "priority", type: "like", value },
				{ field: "orderName", type: "like", value },
			];
			break;
		case "line-item-search":
			table = LineItemTable;
			filterTargetColumns = [
				{ field: "name", type: "like", value },
				{ field: "key", type: "like", value },
				{ field: "type", type: "like", value },
				{ field: "status", type: "like", value },
				{ field: "networkType", type: "like", value },
				{ field: "orderName", type: "like", value },
				{ field: "priority", type: "like", value },
				{ field: "bid", type: "like", value }
			];
			break;
		case "order-search":
			table = OrderTable;
			filterTargetColumns = [
				{ field: "name", type: "like", value },
				{ field: "key", type: "like", value }
			];
			break;
		default:
			// do nothing
	}

	// Apply filter
	let currentFilters = table.getFilters();
	let keepFilters = [];
	if (!_.isEmpty(value)) {
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

// File upload
$("#waterfall-upload-csv").click(function() {
	$('input[type="file"]').trigger("click");
});

$('input[type="file"]').on('change', function() {
	let file = $(this).prop('files')[0];
	if (file == undefined) return;
	// Reset file
	$(this).val("");

	csvManager.processUpload(file, function() {
		// Sort after import
		sortByBidPriority(WaterfallTable);
	});
});

// Add new line item button
$("#add-line-item-btn").click(function() {
	$(".waterfall-filter").hide();
	$(".waterfall-level-buttons").hide();

	$(".network-add-buttons").show().attr("status", "shown");
	$(".add-network-done-buttons").show();

	// Disable Grouping for temporary
	WaterfallTable.setGroupBy(false);
});

// Done button!
$("#close-add-network").click(function() {
	$(".waterfall-filter").show();
	$(".waterfall-level-buttons").show();

	$(".network-add-buttons").hide().attr("status", "hidden");
	$(".add-network-done-buttons").hide();

	// Enable grouping
	WaterfallTable.setGroupBy("priority");

	// If there was selected line items in the add mode, show edit mode (manually trigger row selectionchanged event)
	let selectedRows = WaterfallTable.getSelectedRows();
	if (selectedRows.length > 0) {
		selectedRows[0].toggleSelect();
		selectedRows[0].toggleSelect();
	}
});

// Add Line Item buttons
$(".add-network.add-item").click(function() {
	let orderKey = $(".add-item-order-list.dropdown").dropdown('get value');
	if (_.isEmpty(orderKey.trim())) {
		notifier.show({
			header: "Order Required",
			type: "negative",
			message: "New line item requires Order. Please select Order first."
		});
		return false;
	}
	let type = $(this).attr("id");
	let orderName = $(".add-item-order-list.dropdown").dropdown('get text');

	let mpxRows = WaterfallTable.searchRows("type", "=", "mpx_line_item");
	if (mpxRows.length >= 7 && type == "add-mpx") {
		notifier.show({
			header: "Too many Marketplace line items",
			type: "negative",
			message: "It is not recommended having more than 7 marketplace line items"
		});
		return false;
	}

	// Clear notifiation
	notifier.clear();
	addNewLineItem.add(type, {orderName: orderName, orderKey: orderKey});	
});

// Reset sorting
$("#sort-reset").click(function() {
	sortByBidPriority(WaterfallTable);
});

// Non Events -------------------------------------------------;

let numberOfLineItemsToLoad = 0; // Need to fix this later
function trackNumberOfLineItemsToLoad(callback) {
	numberOfLineItemsToLoad--;
	if (numberOfLineItemsToLoad == 0) {
		callback();
	}
}

function loadLineItemsByOrder(orderKeys, callback) {
	numberOfLineItemsToLoad = orderKeys.length;

	for (let i=0; i < orderKeys.length; i++) {
		let orderKey = orderKeys[i];
		let request = {
			url: BASE_URL + GET_ORDER + "?key=" + orderKey
		};
		if (!orderManager.isCached(orderKey)) {
			http.getRequest(request).then(function(result) {
				orderManager.cache(orderKey, result.responseText);
				updateLineItemTable(orderKey);
				trackNumberOfLineItemsToLoad(callback);
			}).catch(function(error) {
				console.log(`${orderKey} failed to load - ${error.message}`);
				trackNumberOfLineItemsToLoad(callback);
			});
		} else {
			// Load from Cache
			updateLineItemTable(orderKey);
			trackNumberOfLineItemsToLoad(callback);
		}
	}
}

function updateLineItemTable(orderKey) {
	let cachedOrders = orderManager.getOrders();
	for (let i=0; i < cachedOrders.length; i++) {
		if (cachedOrders[i].key == orderKey) {
			let lineItems = cachedOrders[i].lineItems;
			LineItemTable.updateOrAddData(lineItems).then(function() {
				// console.log(`Loading lineitems ${lineItems}`);
			}).catch(function(error) {
				console.log(error.message);
			});
		}
	}
}

function updateAdunitInfo(responseObj) {
	let adUnitId = (responseObj.key).toString();
	let adUnitName = (responseObj.name).toString();

	// Set global AdUnitId variable
	AdUnitId = adUnitId;
	AdUnitName = adUnitName;

	let domToResMapping = {
		"info-adunit-name": (responseObj.name).toString(),
		"info-adunit-id": `<a href="https://app.mopub.com/ad-unit?key=${adUnitId}" target="_blank">${adUnitId}</a>`
	};
	for (let key in domToResMapping) {
		$(`#${key}`).html(domToResMapping[key]);
	}
	if (!responseObj.active) {
		$("#info-adunit-status").removeClass("green gray").addClass("gray");
	} else {
		$("#info-adunit-status").removeClass("green gray").addClass("green");
	}
}

function loadWaterfall(adunitId, callback) {
  let params = `?key=${adunitId}&includeAdSources=true`;
  let url = BASE_URL + GET_ADUNIT + params;
  let request = { url: url };

	// Reset caches
	orderManager.removeCache();
	lineItemManager.removeCache();

	// Empty LineItem Table
	LineItemTable.clearData();

	// Scroll to top
	// scrollToTop();

	// Show loader
	$(".loader-wrapper").dimmer("show");

	// Reset buttons on the top right corner
	resetWaterfallLevelButtons();

	// Make http request
  http.getRequest(request).then(function(result) {
    let responseObj = JSON.parse(result.responseText);
		updateAdunitInfo(responseObj);

		// Temp
		console.log("Initial AdSrouce Response");
		console.log(responseObj.adSources);
		
		// Convert AdSource to LineItem
		let tableData = adSourceManager.convertToLineItem(responseObj.adSources);

    WaterfallTable.blockRedraw();
    WaterfallTable.replaceData(tableData).then(function() {
      WaterfallTable.restoreRedraw();
    }).catch(function(error) {
			console.log(error.responseText);
      WaterfallTable.restoreRedraw();
		});

		// Cache original line item values
		lineItemManager.cacheLineItem(tableData);

		// Load Orders
		OrderTable.blockRedraw();
		loadOrderList(function(responseText) { 
			OrderTable.restoreRedraw();
			$(".loader-order-table").dimmer("hide");
			// Init order list dropdown
			initOrderDropDown(responseText);
		});
		$(".loader-waterfall-table").dimmer("hide");

		callback(true);
  }).catch(function(error) {
		notifier.show({
			header: "Error occured when loading the waterfall. Please make sure to login to MoPub UI or try refreshing the page.",
			type: "negative",
			message: `${error.responseText}`
		});
    console.log(error);
		$(".loader-wrapper").dimmer("hide");
		callback(false);
  });
}

function loadOrderList(callback) {
  let url = BASE_URL + GET_ORDERS;
  let request = { url: url };

  http.getRequest(request).then(function(result) {
    let responseText = result.responseText; 
		OrderTable.replaceData(responseText).then(function() {
			OrderTable.setSort([
				{ column:"activeLineItemCount", dir:"desc" }
			]);
		}).catch(function(error) {
			console.log(error.responseText);
		});
		callback(responseText);
  }).catch(function(error) {
    console.log(error.responseText);
		callback();
  });
}

function sortByBidPriority(table) {
	table.setSort([
		{ column: "bid", dir:"desc" },
		{ column: 'priority', dir:"asc" }
	]);
	return true;
}

function releaseCheckBox(rows) {
	for (let i=0; i < rows.length; i++) {
		rows[i].reformat(); // trigger render event
	}
	$(".select-all").prop("checked", false);
	// Not doing any sort at this point
}

function resetWaterfallLevelButtons() {
	// Reset buttons
	$("#apply-waterfall").hide();
	$("#copy-waterfall").show();
	$("#changes-waterfall").hide();
}

function initOrderDropDown(responseText) {
	let dropdownData = [];
	if (!_.isEmpty(responseText)) {
		let response = JSON.parse(responseText);
		let status;
		for (let i=0; i < response.length; i++) {
			switch (response[i].status) {
				case "running":
					status = `<a class="ui green empty circular label tiny"></a>`;
					break;
				case "paused":
					status = `<a class="ui yellow empty circular label tiny"></a>`;
					break;
				default:
					status = `<a class="ui gray empty circular label mini"></a>`;
					break;
			}
			dropdownData.push({
				name: `${status}${response[i].name}`,
				value: response[i].key
			});
		}
	}
	// order list in new line item add
	$(".add-item-order-list").dropdown({
		clearable: false,
		placeholder: "Search..",
		values: dropdownData,
		onChange: function (value, text, element) {
			if (value) {
				$(".add-item-order-list").removeClass('error');
			}
		}
	});
	// order list in copy form
	$(".copy-form-order-list").dropdown({
		clearable: false,
		placeholder: "Search..",
		values: dropdownData,
		onChange: function (value, text, element) {
			if (value) {
				$(".copy-form-order-list").removeClass('error');
			}
		}
	});
}
