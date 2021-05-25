// Show loader as soon as it opens up
loaders.show("body");

// Extension version
$(".page-footer .extension-version").html(`v${chrome.runtime.getManifest().version}`);

// Once document is ready
$(document).ready(async function() { 

	const initResult = await initialize();

	if (!initResult) {
		console.log("Initialization failed");
		notifier.show(NOTIFICATIONS.initFailed);
		loaders.hide("body");
		return false;
	}	

	// Remove loader
	loaders.hide("body");

  // Show notification if the extension was updated
	wasExtUpdated();
});

async function initialize() {

	// Init tables
	tableInitializer.init();

	// See if there is API key first
	try {
		await initApiKey();
	} catch (error) {
		notifier.show(NOTIFICATIONS.activeApiKeyNotAvailable);
		console.log(error);
		return;
	}

	// Load ad units and orders
	let adUnits, orders;
	try {
		[adUnits, orders] = await loadAdUnitsAndOrdersAndAccount();
	} catch (error) {
		console.log(error);
		return false;
	}

	// Init ad unit dropdowns
	initAdUnitListDropDowns(adUnits);

	// Init order dropdowns
	initOrderDropDowns(orders);

	// Init column selectors and dropdowns
	initColumnSelectors();

	// Init "Type" filters
	initTypeFilters();

	// Init "Status" filters
	initStatusFilters();

	// Init edit form
	editFormManager.initForm();

	// Init dropdowns in copy modal
	initCopyModeDropDown();

	// Init add direct serve item dropdown
	initAddDirectServeItemDropDown();

	return true;
}

function initApiKey() {
	return new Promise(async (resolve, reject) => {
		try {
			await apiKeyManager.loadApiKeys();
			apiKeyManager.updateActiveApiKeyHtml();
		} catch (error) {
			reject("API Key is not available");
		}
		resolve();
	});
}

function initAdUnitListDropDowns(adUnits) {

	const	listInFullFormat = adUnitManager.dropDownFormatter(adUnits);
	const	listWithoutAdFormat = adUnitManager.dropDownFormatterWithoutFormat(adUnits);

	// Dropdown in menu bar
	$(".menu-adunit-dropdown").dropdown({
		placeholder: "Search ad unit name or key",
		values: listInFullFormat,
		fullTextSearch: "exact",
		sortSelect: true,
		onChange: async function (value, text, element) {
			if (validateAdUnitKey(value)) {
				loaders.show("adunit");
				adUnitManager.saveCurrentAdUnit(value);
				infoPanelManager.update(adUnitManager.getAdUnit(value));
				$(".ab-table-section").hide();
				try {
					await loadWaterfallAndBidders(value);
					// Enable control buttons
					$(".control-btn").removeClass("disabled");
				} catch (error) {
					console.log(error);
				}
				loaders.hide("adunit");
			} else {
				console.log(`Invalid Ad Unit Key: ${value}`);
			}
		}
	});

	// Dropdown in edit modal
	$(".edit-adunit-dropdown").dropdown({
		placeholder: "Search ad unit name or key",
		values: listWithoutAdFormat,
		fullTextSearch: "exact",
		sortSelect: true,
		clearable: true,
		direction: "upward"
	});

	// Dropdown in copy modal
	$(".copy-adunit-dropdown").dropdown({
		placeholder: "Search ad unit or key..",
		values: listInFullFormat,
		fullTextSearch: "exact",
		sortSelect: true,
		direction: "upward"
	});
}

function initOrderDropDowns(orders) {
	let dropdownData = [];
	if (!_.isEmpty(orders)) {
		// let response = JSON.parse(responseText);
		let status;
		for (let i=0; i < orders.length; i++) {
			switch (orders[i].status) {
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
				name: `${status}${orders[i].name}`,
				value: orders[i].key
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

function initColumnSelectors() {
	// Create html for column selectors
	const colDefs = tableInitializer.getColumnDefinitions("WaterfallTable");
	colDefs.forEach(column => {
		if (column["field"]) {
			const html = `<option value="${column.field}">${column.title}</option>`;
			$(".column-selector").append(html);
		}
	});

	// Init column selector dropdowns (waterfall table)
	$(".column-selector.waterfall-cols").dropdown({
		direction: "upward",
		onAdd: function(value, text, element) {
			WaterfallTable.showColumn(value);
			WaterfallTable.redraw(true);
		},
		onRemove: function(value, text, element) {
			WaterfallTable.hideColumn(value);
			WaterfallTable.redraw(true);
		}
	});

	// Init column selector dropdowns (line item table)
	$(".column-selector.lineitem-table-cols").dropdown({
		direction: "upward",
		onAdd: function(value, text, element) {
			LineItemTable.showColumn(value);
			LineItemTable.redraw(true);
		},
		onRemove: function(value, text, element) {
			LineItemTable.hideColumn(value);
			LineItemTable.redraw(true);
		}
	});

	// Load saved column list
	chrome.storage.local.get("columnList", function(result) {
		const columnList = result["columnList"];
		if (_.isEmpty(columnList)) {
			$(".column-selector.waterfall-cols").dropdown("set selected", DEFAULT_COLUMN_SET);
			$(".column-selector.lineitem-table-cols").dropdown("set selected", DEFAULT_COLUMN_SET);
		} else {
			$(".column-selector.waterfall-cols").dropdown("set selected", columnList);
			$(".column-selector.lineitem-table-cols").dropdown("set selected", columnList);
		}
	});
}

function initTypeFilters() {
	// Line item type
	for (let key in TYPE_NAME) {
		const html = `<div class="item" data-value="${key}">${TYPE_NAME[key]}</div>`;
		$(html).insertAfter($(".header.item-type"));
	}
	// Network type
	for (let key in NETWORK_TYPE_NAME) {
		const html = `<div class="item" data-value="${key}">${NETWORK_TYPE_NAME[key]}</div>`;
		$(html).insertBefore($(".divider.line-item-type"));
	}

	// Init type filter dropdowns
	$("#type-filter, #type-filter-lineitem").dropdown({
		onChange: function(value, text, selectedItem) {	
			let table;

			let id = $(selectedItem).parents(".dropdown").attr("id");
			switch (id) {
				case "type-filter":
					table = WaterfallTable;
				break;
				case "type-filter-lineitem":
					table = LineItemTable;
					break;
				default:
					return; // do nothing
					break;
			}

			if (value in TYPE_NAME) {
				filterType = "item-type";
			} else if (value in NETWORK_TYPE_NAME) {
				filterType = "network-type";
			} else if (value == "clear-filter") {
				filterType = value;
			} else {
				// do nothing
				return false;
			}

			table.blockRedraw();
			let filters = table.getFilters();

			// Remove existing filters
			for (let i=0; i < filters.length; i++) {
				if (filters[i].field == "type" || filters[i].field == "networkType") {
					_.pullAt(filters, i);
				}
			}
			if (filterType == "item-type") {
				filters.push({field: "type", type: "=", value: value});
				table.setFilter(filters);
				$(`#${id}`).addClass("brown");
			} else if (filterType == "network-type") {
				filters.push({field: "networkType", type: "=", value: value});
				table.setFilter(filters);
				$(`#${id}`).addClass("brown");
			} else if (filterType == "clear-filter") {
				table.setFilter(filters);
				$(`#${id}`).dropdown('restore defaults');
				$(`#${id}`).removeClass("brown");
			} else {
				// do nothing
			}
			table.restoreRedraw();
		}
	});
}

function initCopyModeDropDown() {
	// Copy(Duplicate) Mode (In Copy waterfall form)
	$("#copy-mode").dropdown({ 
		showOnFocus: false,
		onChange: function(value, text, selectedItem) {
			if (value == "in_one_existing_order") {
				$("#copy-form-order-list-field").show();
			} else {
				$("#copy-form-order-list-field").hide();
			}
    }
	});
}

function initAddDirectServeItemDropDown() {
	// Add line item direct button
	$("#add-direct").dropdown({
		onChange: function (value, text, choice) {
			let orderKey = $(".add-item-order-list.dropdown").dropdown('get value');
			if (_.isEmpty(orderKey.trim())) {
				toast.show(NOTIFICATIONS.orderRequired);
				return false;
			}
			const type = value;
			const order = orderTableController.getOrderByKey(orderKey);
			const adUnitKey = adUnitManager.getCurrentAdUnitKey();
		
			newLineItemFactory.add(type, order, adUnitKey);	
		}
	});
}

function initStatusFilters() {
	// Status Filter Action
	$('#status-filter, #status-filter-lineitem').dropdown({
		onChange: function(value, text, element) {
			let table;

			let id = $(element).parents(".dropdown").attr("id");
			switch (id) {
				case "status-filter":
					table = WaterfallTable;
				break;
				case "status-filter-lineitem":
					table = LineItemTable;
					break;
				case "status-filter-order":
					table = OrderTable;
					break;
				default:
					return; // do nothing
					break;
			}

			table.blockRedraw();
			let filters = table.getFilters();

			// Remove existing status filter
			for (let i=0; i < filters.length; i++) {
				if (filters[i].field == "status") {
					_.pullAt(filters, i);
				}
			}

			// New status
			let statusFilter = {};
			switch (value) {
				case "running":
					statusFilter = {field: "status", type: "=", value: "running"};
					break;
				case "paused":
					statusFilter = {field: "status", type: "=", value: "paused"};
					break;
				case "archived":
					statusFilter = {field: "status", type: "=", value: "archived"};
					break;
				default: // all
					statusFilter = {};
					break;
			}

			if (!_.isEmpty(statusFilter)) {
				filters.push(statusFilter);
				table.setFilter(filters);
				$(`#${id}`).addClass("brown");
			} else {
				$(`#${id}`).removeClass("brown");
				if (filters.length == 0) {
					table.clearFilter(true);
				} else {
					table.setFilter(filters); // update with status filter removed.
				}
			}

			table.restoreRedraw();
		}
	});

	// Set default status filter
	// $("#status-filter-order").dropdown('set selected', "running");
}

function loadWaterfallAndBidders(adUnitKey) {
	return new Promise(async (resolve, reject) => {
		const tasks = [
			waterfallTableController.loadLineItems(adUnitKey),
			abTableController.loadBidders(adUnitKey)
		];
		// The order is preserved so..
		Promise.allSettled(tasks).then((results) => {
			if (results[0].status == "rejected") {
				// Failed to get the list of line items
				reject(results[0].reason);
				return;
			}
			// Show AB table based on the result (API returns 400 if AB enabled is not enabled for the ad unit)
			if (results[1].status == "fulfilled") {
				$(".ab-table-section").show(); 
				infoPanelManager.updateABStatus(true);
			} else {
				$(".ab-table-section").hide();
				infoPanelManager.updateABStatus(false);
			}

			resolve(results);
		});
	});
}

function loadAdUnitsAndOrdersAndAccount() {
	return new Promise(async (resolve, reject) => {
		const tasks = [
			adUnitManager.loadAdUnits(),
			orderTableController.loadOrders(),
			accountManager.loadUserInfo(),
			accountManager.loadAccountInfo()
		];

		// The order is preserved so..
		Promise.allSettled(tasks).then((results) => {
			results.forEach(result => {
				if (result.status == "rejected") {
					reject(result.reason);
					return;
				}
			});
			resolve([
				results[0].value,
				results[1].value,
				results[2].value,
				results[3].value
			]);
		});
	});
}

function wasExtUpdated() {
	chrome.storage.local.get("extUpdated", function(result) {
    if(result["extUpdated"]) {
      notifier.show(NOTIFICATIONS.extensionUpdated);
    }
    chrome.storage.local.set({"extUpdated": false});
  });
}