// Remove flash after animation
$("#waterfall-adunit").on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
	$(".flash").removeClass('flash');
});

// Notification Dismiss
$('#notification').on('click', '.message .close', function() {
  $(this).closest('.message').transition('fade');
});

// Load Waterfall Button
$("#load-waterfall").click(function() {
	let adunitId = $("#adunit-id").val().trim();
	let buttonObj = $(this);
	// [To-do]: Validation
	
	// Temp Adunit
	// adunitId = "03ef292dddd846eb8d81abf546feaac8";
	// adunitId = "297694651d3948e2b682a290ab36309e";
	AdUnitId = adunitId;

	// Reset caches
	orderCacher.delete();
	lineItemCacher.delete();

	// Show loader
	buttonObj.addClass("loading disabled");
	$(".loader-wrapper").dimmer("show");

	// Load Waterfall
	loadWaterfall(adunitId, function() {
		$(".loader-waterfall-table").dimmer("hide");
		$(".loader-adunit-info").dimmer("hide");
		buttonObj.removeClass("loading disabled");
	});

	// Load Orders
	loadOrderList(function() {
		$(".loader-order-table").dimmer("hide");
	});

	// Empty LineItem Table
	LineItemTable.clearData();
	
	return false;
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

// Select All Button Waterfall
$("#select-all-waterfall").click(function() { 
	let rows = WaterfallTable.getRows('active'); 
	for (let i=0; i < rows.length; i++) {
		rows[i].toggleSelect();		
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
	WaterfallTable.download("csv", "data.csv");
})

// Edit selected lineitems
$("#edit-selected").click(function() {
	let data = WaterfallTable.getSelectedData();
	if (_.isEmpty(data)) return;
	$('.ui.modal').modal('show');
});

// Edit Submit button
$("#edit-submit").click(function() {
	let formData = $('#edit-form').serializeArray();

	// Validate form data and targeting requirement
	let targetMode, targetCountries;
	for (let i=0; i < formData.length; i++) {
		formData[i].value = (formData[i].value).trim();
		if (formData[i].name == "target-mode") {
			targetMode = formData[i].value;
		} else if (formData[i].name == "target-country") {
			targetCountries = formData[i].value;
			if (targetMode == "all") {
				formData[i].value = "all"; // Temporary flag
			} else if (targetMode != "all" && !_.isEmpty(targetMode) && _.isEmpty(targetCountries)) {
				$("#target-country").closest('.field').addClass('error');
				console.log("User did not select countries");
				return false;
			}
		}
	}

	let selectedRowData = WaterfallTable.getSelectedData();

	for (let i=0; i < selectedRowData.length; i++) {
		let lineitem = selectedRowData[i];

		// Update each lineitem
		for (let j=0; j < formData.length; j++) {
			let eachData = formData[j];
			if (_.isEmpty(eachData.value)) continue; // Skip if data is null
			switch(eachData.name) {
				case "cpm":
					lineitem.bid = parseFloat(eachData.value);
					break;
				case "priority":
					if (lineitem.type != "marketplace") {
						lineitem.priority = parseInt(eachData.value);	 
					}
					break;
				case "status":
					lineitem.status = eachData.value;
					break;
				case "network_adunit_id":
					if (lineitem.type == "network") {
						lineitem.overrideFields.network_adunit_id = eachData.value;
					}
					break;
				case "network_app_id":
					if (lineitem.type == "network") {
						lineitem.overrideFields.network_app_id = eachData.value;
					}
					break;
				case "network_account_id":
					if (lineitem.type == "network") {
						lineitem.overrideFields.network_account_id = eachData.value;
					}
					break;
				case "target-mode":
					if (lineitem.type != "marketplace") {
						lineitem.includeGeoTargeting = eachData.value;	 
					}
					break;
				case "target-country":
					if (lineitem.type != "marketplace") {
						// See above form data validation
						lineitem.countries = (eachData.value == "all") ? [] : (eachData.value).split(",");
					}
					break;
				default:
			}	
		}
	}

	WaterfallTable.updateData(selectedRowData).then(function() {
		console.log("Updated WaterfallTable");
		WaterfallTable.deselectRow();
		WaterfallTable.redraw();
		$('.ui.modal').modal('hide');
	}).catch(function(error) {
		console.log(`Update failed - ${error.message}`);
		WaterfallTable.deselectRow();
		WaterfallTable.redraw();
		$('.ui.modal').modal('hide');
	});

	// Reset the form 
	$('#edit-form').trigger("reset");
	$('#edit-form .dropdown').dropdown('clear');
	$("#target-country").closest('.field').addClass('disabled').removeClass('required');
});


// Apply to MoPub
$("#apply-waterfall").click(function() {
	updateMoPub.adUnitWaterfall();	
});

// Move Selected Button
$("#move-selected").click(function() {
	let rowDatas = LineItemTable.getSelectedData();
	if (_.isEmpty(rowDatas)) return;

	for (let i=0; i < rowDatas.length; i++) {
		let data = rowDatas[i];
		data['secondaryName'] = data.orderName;
		if (!data.adUnitKeys.includes(AdUnitId)) { 
			data.adUnitKeys.push(AdUnitId); // Assign AdUnit Id
		}
	}

	let selectedRows = LineItemTable.getSelectedRows();
	for (let i=0; i < selectedRows.length; i++) {
		selectedRows[i].delete();
	}

	WaterfallTable.updateOrAddData(rowDatas);
});

// Select All Button LineItem
$("#select-all-lineitem").click(function() { 
	let rows = LineItemTable.getRows('active'); 
	for (let i=0; i < rows.length; i++) {
		rows[i].toggleSelect();		
	}
});

// Select All Button Order
$("#select-all-order").click(function() { 
	let rows = OrderTable.getRows('active'); 
	for (let i=0; i < rows.length; i++) {
		rows[i].toggleSelect();		
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
		loadLineItemsByOrder(orderKeys, function() {
			$("#loader-lineitem-table").dimmer("hide");
			buttonObj.removeClass('loading disabled');
		});
	}
});

let numberOfLineItemsToLoad = 0;
function loadLineItemsByOrderCounter(callback) {
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

		if (!orderCacher.isCached(orderKey)) {
			http.getRequest(request).then(function(result) {
				orderCacher.cache(orderKey, result.responseText);
				lineItemCacher.cacheLineItem(result.responseText);
				updateLineItemTable(orderKey);
				loadLineItemsByOrderCounter(callback);
			}).catch(function(error) {
				console.log(`${orderKey} failed to load - ${error.message}`);
				loadLineItemsByOrderCounter(callback);
			});
		} else {
			// Load from Cache
			updateLineItemTable(orderKey);
			loadLineItemsByOrderCounter(callback);
		}
	}
}

function updateLineItemTable(orderKey) {
	let cachedOrders = orderCacher.getOrders();
	for (let i=0; i < cachedOrders.length; i++) {
		if (cachedOrders[i].key == orderKey) {
			let lineItems = cachedOrders[i].lineItems;
			LineItemTable.updateOrAddData(lineItems).then(function() {
				LineItemTable.setFilter(LineItemTable.getFilters()); // Apply filter again!
				LineItemTable.setSort([
					{ column:"orderName", dir:"desc" }
				]);
			}).catch(function(error) {
				console.log(error.message);
			});
		}
	}
}

function updateAdunitInfo(responseObj) {
	let domToResMapping = {
		"info-adunit-name": (responseObj.name).toString(),
		"info-adunit-id": (responseObj.key).toString(),
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
		$("#info-adunit-status").removeClass("green gray").addClass("gray").html("Inactive");
	} else {
		$("#info-adunit-status").removeClass("green gray").addClass("green").html("Active");
	}
}

function loadWaterfall(adunitId, callback) {
  let params = `?key=${adunitId}&includeAdSources=true`;
  let url = BASE_URL + GET_ADUNIT + params;
  let request = { url: url };

  http.getRequest(request).then(function(result) {
    let responseObj = JSON.parse(result.responseText);
		updateAdunitInfo(responseObj);
		
    let tableData = responseObj.adSources;
    WaterfallTable.replaceData(tableData).then(function() {
      WaterfallTable.setSort([
        { column: "bid", dir:"desc" },
        { column: 'priority', dir:"asc" }
      ]);
    }).catch(function(error) {
			console.log(error.responseText);
		});

		lineItemCacher.cacheAdSource(tableData); // Cache Original LineItem Value (AdSource)
		callback();
  }).catch(function(error) {
    console.log(error.responseText);
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


