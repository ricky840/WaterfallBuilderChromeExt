// Remove flash after animation
$("#waterfall-adunit").on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
	$(".flash").removeClass('flash badge update-badge new-badge');
});

// Notification Dismiss
$('#notification, #edit-form-notification, #copy-form-notification').on('click', '.message .close', function() {
  $(this).closest('.message').hide();
	$(this).siblings('.header').html('');
	$(this).siblings('.content').html('');
});

// Show and Hide lineitem button
$("#add-adsource").click(function() {
	if($("#adsource-section").is(":hidden")) {
		$('#waterfall-adunit').parents('#waterfall-section').removeClass().addClass('nine wide column');
		$('#adsource-section').show();
		$(this).html(`<i class="chevron right icon"></i>Hide LineItems`);
		WaterfallTable.redraw();
		LineItemTable.redraw();
		OrderTable.redraw();
	} else {
		$('#waterfall-adunit').parents('#waterfall-section').removeClass().addClass('sixteen wide column');	
		$('#adsource-section').hide();
		$(this).html(`<i class="chevron left icon"></i>Show LineItems`);
		WaterfallTable.redraw();
		LineItemTable.redraw();
		OrderTable.redraw();
	}
});	

// Select All Buttons
$(".select-all").click(function() { 
	let table = $(this).attr("table");
	let selected = $(this).attr('row-selected');
	let rows = [];
	switch(table) {
		case "waterfall":
			rows = WaterfallTable.getRows('active'); 
			break;
		case "lineitem":
			rows = LineItemTable.getRows('active'); 
			break;
		case "order":
			rows = OrderTable.getRows('active'); 
			break;
		default:
			break;
	}
	for (let i=0; i < rows.length; i++) {
		let rowElement = rows[i].getElement();
		if ($(rowElement).hasClass('tabulator-unselectable')) continue;
		selected ? rows[i].deselect() : rows[i].select();
	}
	if (selected) {
		$(this).html("Select All").removeAttr('row-selected');
	} else {
		$(this).html("Deselect All").attr('row-selected', 'true');
	}
});

// Toggle Grouping Button
$("#disable-grouping-waterfall").click(function() {
	if (WaterfallGrouping) {
		WaterfallTable.setGroupBy(false);
		WaterfallGrouping = false;
	} else {
		WaterfallTable.setGroupBy("priority");
		WaterfallGrouping = true;
	}
});

// Download CSV Button
$("#waterfall-download-csv").click(function() {
	$('#download-only-filtered').prop('checked', false);
	$('.ui.modal.download-option-modal').modal('show');
});

$(".download-button").click(function() {
	csvManager.downloadCsv($(this).attr("option"), function() {
		$('.ui.modal.download-option-modal').modal('hide');
	});
});

// Edit selected lineitems
$("#edit-selected").click(function() {
	let data = WaterfallTable.getSelectedData();
	if (_.isEmpty(data)) return;
	editFormManager.resetForm();
	$('.ui.modal.edit-modal').modal('show');
});

// Edit Submit button
$("#edit-submit").click(function() {
	let formData = $('#edit-form').serializeArray();
	let input = editFormManager.parseInput(formData);

	// Temp
	console.log("Edit form user input");
	console.log(input);

	// Validate country targeting inputs
	if (input.targetMode != "all" && !_.isEmpty(input.targetMode) && _.isEmpty(input.targetCountries)) {
		$("#target-country").closest('.field').addClass('error');
		console.log("User did not select countries");
		return false;
	}

	// Validte network data
	let overrideFields;
	if (!_.isEmpty(input.networkType)) {
		let networkInfo = {
			network_app_id: input.networkAppId,
			network_adunit_id: input.networkAdUnitId,
			app_signature: input.appSignature,
			location: input.location,
			custom_event_class_name: input.customEventClassName,
			custom_event_class_data: input.customEventClassData
		}
		try {
			overrideFields = overrideFieldValidator.validate(input.networkType, networkInfo);
			console.log(overrideFields);
		} catch(error) {
			notifier.editFormShow({message: error, type: "negative"});
			console.log(error);
			return false;
		}
	}

	// All data is ready let's update
	let selectedRowData = WaterfallTable.getSelectedData();
	for (let i=0; i < selectedRowData.length; i++) {
		let lineItem = selectedRowData[i];
		// Update each lineItem
		if (!_.isEmpty(input.cpm)) lineItem.bid = input.cpm;
		if (!_.isEmpty(input.status)) lineItem.status = input.status;
		// Do not update marketplace
		if (!_.isEmpty(input.priority) && lineItem.type != "marketplace") {
			lineItem.priority = parseInt(input.priority);
		}
		// Update only network
		if (lineItem.type == "network") {
			if (lineItem.networkType == input.networkType && !_.isEmpty(overrideFields)) {
				lineItem.overrideFields = overrideFields;
			}
		}
		// Update geo targeting
		if (!_.isEmpty(input.targetMode) && lineItem.type != "marketplace") {
			lineItem.includeGeoTargeting = input.targetMode;
			lineItem.targetedCountries = (input.targetMode == "all") ? [] : (input.targetCountries).split(",");
		}
		// Update keyword targeting
		if (!_.isEmpty(input.keywords) && lineItem.type != "marketplace") {
			lineItem.keywords = (input.keywords).split(",");
		}
	}

	// Lock Table
	WaterfallTable.blockRedraw();
	afterUpdate = function() {
		WaterfallTable.deselectRow();
		resetSelectAllButton('waterfall');
		WaterfallTable.restoreRedraw();
		$('.ui.modal.edit-modal').modal('hide');
		editFormManager.resetForm(); // Reset the form
	};
	
	WaterfallTable.updateData(selectedRowData).then(function() {
		console.log("Updated WaterfallTable");
		afterUpdate();
	}).catch(function(error) {
		console.log(`Update failed - ${error.message}`);
		afterUpdate();
	});
});

// $("#delete-selected").click(function() {
// 	let rowDatas = WaterfallTable.getSelectedData();
// 	if (_.isEmpty(rowDatas)) return;
//
// 	let deleteRowIndex = [];
// 	let button = $(this);
// 	button.addClass("loading disabled");
//
// 	for (let i=0; i < rowDatas.length; i++) {
// 		let data = rowDatas[i];
// 		deleteRowIndex.push(data.key);
// 	}
//
// 	loadingIndicator.setTotalBarLoader(rowDatas.length);
// 	loadingIndicator.showBarLoader();
// 	WaterfallTable.blockRedraw();
//
// 	let afterUpdate = function() {
// 		WaterfallTable.restoreRedraw();
// 		loadingIndicator.hideBarLoader();
// 		button.removeClass("loading disabled");
// 		$("#status-filter").trigger('change');
// 		WaterfallTable.setSort([
// 			{ column: "bid", dir:"desc" },
// 			{ column: 'priority', dir:"asc" }
// 		]);
// 	};
//
// 	setTimeout(function() { 
// 		WaterfallTable.deleteRow(deleteRowIndex).then(function(rows) {
// 			afterUpdate();
// 		}).catch(function(error) {
// 			afterUpdate();
// 			console.log(error.message);
// 		});
// 	}, 200);
// });

$("#copy-waterfall").click(function() {
	$('.ui.modal.copy-waterfall-modal').modal('show');
	let input = $("#tagify-adunits")[0];
	adUnitManager.loadAdUnits("list-name-id", function(adUnitList) {
		if (adUnitList) {
			if (AdUnitTagify == undefined) {
				// Initialize Tagify
				AdUnitTagify = new Tagify(input, {
					mode: "select",
					enforceWhitelist: true,
					whitelist: adUnitList,
					keepInvalidTags: false,
					placeholder: "Select or search ad unit or id",
					skipInvalid: true,
					dropdown: {
						position: "manual",
						maxItems: Infinity,
						classname: "customSuggestionsList"
					},
				});
				AdUnitTagify.dropdown.show.call(AdUnitTagify); // load the list
				AdUnitTagify.DOM.scope.parentNode.appendChild(AdUnitTagify.DOM.dropdown);
			} else {
				// If already initialized, just remove previous tag.
				AdUnitTagify.removeAllTags();
			}
		} else {
			console.log("Error loading adunits");
			$('.ui.modal.copy-waterfall-modal').modal('hide');
		}
	});
});

$("#copy-submit").click(function() {
	let copyMode = $('#copy-mode').val();
	let copyOnlyFiltered = $('#copy-only-filtered').is(':checked');
	let selectedValues = $("#tagify-adunits").val();
	let lineItems = (copyOnlyFiltered) ? WaterfallTable.getData("active") : WaterfallTable.getData();
	
	try {
		selectedValues = JSON.parse(selectedValues);
	} catch (error) {
		notifier.copyFormShow({message: "Please select ad unit", type: "negative"});
		console.log("No Adunit was selected");
		return false;
	}

	let adUnitIds = [];
	for (let i=0; i < selectedValues.length; i++) {
		let eachAdUnitNameAndKey = selectedValues[i].value;
		adUnitIds.push(eachAdUnitNameAndKey.match(/.*\(([0-9|a-z]{32})\).*/)[1]);
	}

	$('.ui.modal.copy-waterfall-modal').modal({
		onHide: function() {
			scrollToTop();
			waterfallDuplicator.duplicate(adUnitIds, lineItems, copyMode, function() {
				$(".all-content-wrapper").dimmer("hide");
			});
		}
	}).modal('hide');
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
	$("#change-table-count").html(`<b>Total ${_.keys(refinedChanges).length} Changes</b>`);
	$('.ui.modal.review-change-modal').modal('show');
});

$("#review-submit").click(function() {
	$('.ui.modal.review-change-modal').modal({
		onHide: function() {
			scrollToTop();
			let lineItemChanges = lineItemManager.getLineItemChanges();
			moPubUI.updateWaterfall(lineItemChanges, function(result) {
				$(".all-content-wrapper").dimmer("hide");
				loadWaterfall(AdUnitId, function() {
					// Hmm.. do nothing for now
				});
			});	
		}
	}).modal('hide');
});


// Assign or Duplicate LineItems
$(".lineitem-action-buttons").click(function() {
	let rowDatas = LineItemTable.getSelectedData();
	if (_.isEmpty(rowDatas)) return;

	let button = $(this);
	button.addClass("loading disabled");
	let action = button.attr("action");

	let deleteRowIndex = [];

	for (let i=0; i < rowDatas.length; i++) {
		let data = rowDatas[i];
		
		if (action == "assign") {
			if (!data.adUnitKeys.includes(AdUnitId)) { 
				data.adUnitKeys.push(AdUnitId); // Assign AdUnit Id
				console.log(`Assigning adunit ${AdUnitId} for ${data.key}`);
			}
		} else if (action == "duplicate") {
			data.adUnitKeys = [AdUnitId];
			data.key = "temp-" + stringGen(32);
			data.name += " (Duplicated)";
			console.log(`Duplicating ${data.key}`);
		}

		deleteRowIndex.push(data.key);
	}

	notifier.clear();
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
		resetSelectAllButton('lineitem');
		WaterfallTable.setSort([
			{ column: "bid", dir:"desc" },
			{ column: 'priority', dir:"asc" }
		]);
	};

	// Give it a short delay
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

		loadLineItemsByOrder(orderKeys, function() {
			OrderTable.deselectRow();
			resetSelectAllButton('order');
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
$("#adsource-section").on("keyup", "#order-search, #line-item-search", function() {
	let table = ($(this).attr('id') == "line-item-search") ? LineItemTable : OrderTable;
	let value = $(this).val().trim();
	if (!_.isEmpty(value)) {
		table.setFilter("name", "like", value);
	} else {
		table.clearFilter(true);
	}
});

// File upload
$("#waterfall-upload-csv").click(function() {
	$('input[type="file"]').trigger("click");
});

$('input[type="file"]').on('change', function() {
	let file = $(this).prop('files')[0];
	if (file == undefined) return;

	$(this).val("");
	$(".loader-waterfall-table").dimmer("show");

	csvManager.processUpload(file, function() {
		$(".loader-waterfall-table").dimmer("hide");
	});
});

// Custom Html Link Click
$("#waterfall-adunit").on('click', ".customHtml", function(event) {
	let key = $(this).attr("key");	
	let body = customHtmlStore.load(key);
	window.open(`/customHtml.html?key=${key}`, '_blank');
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
				lineItemManager.cacheLineItemByOrder(result.responseText);
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
	let domToResMapping = {
		"info-adunit-name": (responseObj.name).toString(),
		"info-adunit-id": `<a href="https://app.mopub.com/ad-unit?key=${adUnitId}" target="_blank">${adUnitId}</a>`,
		"info-app-name": (responseObj.appName).toString(),
		"info-app-key": (responseObj.appKey).toString(),
		"info-app-os": (responseObj.appType).toString(),
		"info-adunit-format": (responseObj.format).toString(),
		"info-adunit-unified": (responseObj.isUnifiedFormat).toString(),
		"info-adunit-landscape": (responseObj.details.landscape).toString(),
		"info-adunit-device-format": (responseObj.details.deviceFormat).toString(),
		"info-adunit-refresh-interval": (responseObj.details.refreshInterval).toString() + `s`
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

	// Set global AdUnitId variable
	AdUnitId = adunitId;

	// Reset caches
	orderManager.removeCache();
	lineItemManager.removeCache();
	customHtmlStore.reset();

	// Empty LineItem Table
	LineItemTable.clearData();

	// Scroll to top
	scrollToTop();

	// Show loader
	$(".loader-wrapper").dimmer("show");

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
			// sortByBidPriority(WaterfallTable);
      WaterfallTable.restoreRedraw();
    }).catch(function(error) {
			console.log(error.responseText);
      WaterfallTable.restoreRedraw();
		});

		// Cache original line item values
		lineItemManager.cacheLineItem(tableData);

		// Load Orders
		OrderTable.blockRedraw();
		loadOrderList(function() { 
			OrderTable.restoreRedraw();
			$(".loader-order-table").dimmer("hide"); 
		});
		$(".loader-waterfall-table").dimmer("hide");
		$(".loader-adunit-info").dimmer("hide");

		callback();
  }).catch(function(error) {
		notifier.show({
			header: "Error occured when loading the waterfall. Please make sure to login to MoPub UI or try refreshing the page.",
			type: "negative",
			message: `${error.responseText}`
		});
    console.log(error.responseText);
		$(".loader-wrapper").dimmer("hide");
		callback();
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
		callback();
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

function resetSelectAllButton(table) {
	$(`button[table='${table}']`).html("Select All").removeAttr('row-selected');
}
