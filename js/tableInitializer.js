var tableInitializer = (function(global) {
  "use strict";

	let placeHolder = `<br><h4 class="ui header grey">No Data Available</h4><br><br><br>`;
	let lineItemSearchInputHtml = `<span class="count-lineitems-wrapper"></span>
																 <div class="ui icon input small search-table-wrapper">
																 	 <input type="text" placeholder="Search line item name" id="line-item-search" class="mopub-input-search">
																	 <i class="search icon"></i>
																 </div>`;
	let orderSearchInputHtml = `<span class="count-orders-wrapper"></span>
															<div class="ui icon input small search-table-wrapper">
																<input type="text" placeholder="Search order name" id="order-search" class="mopub-input-search">
																<i class="search icon"></i>
															</div>`;
	let waterfallTableFooterHtml = `<span class="count-waterfall-wrapper"></span>`;

	function init() {
		initAdUnitWaterfallTable();
		initOrderListTable();
		initLineItemListTable();
	}

  function flashRow(row, status) {
		loadingIndicator.increaseBar(); // Hmm..
    let rowElement = row.getElement();
		if (status == 'new') {
			$(rowElement).addClass("flash");
			notifier.show({
				header: `LineItems Added (${loadingIndicator.getBarLength()} Items)`,
				message: `${row.getData().name}: <b>${row.getData().key}</b>`, 
				type: "success", 
				append: true
			});
		}
		if (status == 'updated') {
			$(rowElement).addClass("flash");
		}
  }

	function updateWaterfallItemCount(count) {
		let html = `<span class="count-waterfall-items">Total ${count} Line Items</span>`;
		$(".count-waterfall-wrapper").html(html);
	}

	function initAdUnitWaterfallTable() {
    WaterfallTable = new Tabulator("#waterfall-adunit", {
			height: WATERFALL_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			index: "key", // To avoid duplicates in the table
			tooltips: true,
			placeholder: placeHolder,

			// Row Change callbacks
      rowAdded: function(row) { 
				flashRow(row, 'new');
				updateWaterfallItemCount(WaterfallTable.getDataCount("active"));

				// let rowData = row.getData();
				// if (!_.has(rowData, "origin")) rowData.origin = "new";
				// WaterfallTable.updateData([rowData]);
			},
      rowUpdated: function(row) { 
				flashRow(row, 'updated');
			},
			rowMoved: function(row) {
				// flashRow(row, 'moved');
				// this.setSort([
				// 	{ column: "bid", dir:"desc" },
				// 	{ column: 'priority', dir:"asc" }
				// ]);
			},
			rowDeleted: function(row) { 
				updateWaterfallItemCount(WaterfallTable.getDataCount("active"));
				// Need to track deleted items
				// loadingIndicator.increaseBar(); 
				// notifier.show({
				// 	header: "Removed LineItems",
				// 	message: `${row.getData().name} - ${row.getData().key}`, 
				// 	type: "info", 
				// 	append: true
				// });
			},

			dataFiltered: function(filters, rows) {
				updateWaterfallItemCount(rows.length);
			},

			// Manage Row Movement
			movableRows: true,
			movableRowsReceiver: function(fromRow, toRow, fromTable) {
				let insertData = fromRow.getData();
				if (!insertData.adUnitKeys.includes(AdUnitId)) {
					insertData.adUnitKeys.push(AdUnitId); // Connect to New AdUnit #Important! AdUnitId is global variable
					// insertData.origin = "assigned";
					console.log(`Assigning adunit ${AdUnitId} for ${insertData.key}`);
				}
				WaterfallTable.updateOrAddData([insertData]);
				return true;
			},
		
			// Grouping config
			groupBy: "priority",
			groupToggleElement: false,
			groupHeader: function(value, count, data, group) {
				let html = `Priority ${value} (${count} line items)`;
				// let html = `Priority <a class="ui gray circular label">${value}</a>`;
				return html;
			},

			// Disable Rows that doesn't supported for now.
			selectableCheck: function(row) {
				let status = row.getData().status;
				let type = row.getData().type;
				let regex = /campaign\-|segment\-|scheduled/;
				let regexType = /advanced\_|pmp\_|segment/;
				if (status.match(regex) || type.match(regexType)) {
					let rowElement = row.getElement();
					$(rowElement).addClass('tabulator-unselectable');
					return false;	
				}
				return true;
			},
			
			columns: tableColumnDef.getColumnDef("WaterfallTable"),

			initialSort: [
				{ column:"bid", dir:"desc" },
				{ column:"priority", dir:"asc" }
			],
			
			// Footer
			footerElement: waterfallTableFooterHtml
		});
	}

	function initLineItemListTable() {
		LineItemTable = new Tabulator("#lineitem-list", {
			height: LINEITEM_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			selectable: true,
			tooltips: true,
			placeholder: placeHolder,
			index: "key", // To avoid dup in the table

			// Movable Row Config
			movableRows: true,
			movableRowsConnectedTables: "#waterfall-adunit",
			movableRowsSender: "delete",

			// Pagination
			pagination: "local",
			paginationSize: LINEITEM_PAGINATION_SIZE,

			rowAdded: function(row) {
				let html = `<span class="count-lineitems">${LineItemTable.getDataCount()} Items</span>`;
				$(".count-lineitems-wrapper").html(html);
			},

			dataFiltered: function(filters, rows) {
				let html = `<span class="count-lineitems">${rows.length} Items</span>`;
				$(".count-lineitems-wrapper").html(html);
			},

			// Disable Rows that doesn't supported for now.
			selectableCheck: function(row) {
				let status = row.getData().status;
				let type = row.getData().type;
				let regex = /campaign\-|segment\-|scheduled/;
				let regexType = /advanced\_|pmp\_|segment/;
				if (status.match(regex) || type.match(regexType)) {
					let rowElement = row.getElement();
					$(rowElement).addClass('tabulator-unselectable');
					return false;	
				}
				return true;
			},

			// Column Definition
			columns: tableColumnDef.getColumnDef("LineItemTable"),

			// Initial Sort
			initialSort:[
				// { column:"activeLineItemCount", dir:"desc" }
			],

			// Footer Search
			footerElement: lineItemSearchInputHtml
		});
	}

	function initOrderListTable() {
		OrderTable = new Tabulator("#order-list", {
			height: ORDER_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			selectable: true,
			tooltips: true,
			placeholder: placeHolder,

			// Pagination
			pagination: "local",
			paginationSize: ORDER_PAGINATION_SIZE,

			// selectable Check for Status
			selectableCheck: function(row) {
				let status = row.getData().status;
				if (status != "running") {
					let rowElement = row.getElement();
					$(rowElement).addClass('tabulator-unselectable');
					return false;	
				}
				return true;
			},
	
			dataLoaded: function(data) {
				let html = `<span class="count-orders">${data.length} Items</span>`;
				$(".count-orders-wrapper").html(html);
			},
			
			dataFiltered: function(filters, rows) {
				let html = `<span class="count-orders">${rows.length} Items</span>`;
				$(".count-orders-wrapper").html(html);
			},

			columns: tableColumnDef.getColumnDef("OrderTable"),

			initialSort:[
				{ column:"activeLineItemCount", dir:"desc" }
			],

			// Footer Search
			footerElement: orderSearchInputHtml
		});
	}

  return {
    init: init
  }
})(this);
