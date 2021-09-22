var tableInitializer = (function(global) {
  "use strict";

	const placeHolder = `<h4 class="ui header grey">No data available</h4>`;
	const lineItemPlaceHolder = `<h4 class="ui header grey">Select order and load line items</h4>`;
	// const abPlaceHolder = `<h3 class="ui header grey">No data available</h3>`;
	const lineItemSearchInputHtml = `<span class="count-lineitems-wrapper"></span>`;
	const orderSearchInputHtml = `<span class="count-orders-wrapper"></span>`;
	const waterfallTableFooterHtml = `<span class="count-waterfall-wrapper"></span>`;
	const abTableFooterHtml = `<span class="count-ab-wrapper"></span>`;

	const regexSupportedStatus = /^running$|^paused$|^archived$/;
	const regexUnsupportedType = /advanced\_|pmp\_|segment/;

	function init() {
		initAdUnitWaterfallTable();
		initOrderListTable();
		initLineItemListTable();
		initABTable();
	}

	function getVisibleColumns(tableName) {
		let visibleColumns = [];
		const colDefs = getColumnDefinitions(tableName);
		colDefs.forEach(column => {
			if (column["field"] && column.visible == true) visibleColumns.push(column.field);
		});
		return visibleColumns;
	}

	function getColumnDefinitions(tableName) {
		switch(tableName) {
			case "WaterfallTable":
				return WaterfallTable.getColumnDefinitions();
			case "OrderTable":
				return OrderTable.getColumnDefinitions();
			case "LineItemTable":
				return LineItemTable.getColumnDefinitions();
			default:
				return WaterfallTable.getColumnDefinitions();
		}
	}

	function updateNumberOfChangeButton() {
		const count = lineItemStore.getTotalNumberOfChanges();
		$(".total-change-count").html(count);
	}

	function syncUpWithStore(row, event) {
		const rowData = row.getData();
		if (event == "new") {
			lineItemStore.saveLineItem(rowData, true);
		} else {
			lineItemStore.updateLineItem(rowData);
		}
	}

	function addBadge(row) {
		const rowData = row.getData();
		const lineItem = lineItemStore.getLineItemByKey(rowData.key);

		// console.log("adding badge");
		// console.log(lineItem.isNewlyCreated());
		// console.log(lineItem.getChanges());

		if (lineItem.isNewlyCreated()) {
			row.getElement().classList.remove("updated-row");
			row.getElement().classList.add("add-new");
		} else if (lineItem.isUpdated() && !lineItem.isNewlyCreated()) {
			row.getElement().classList.remove("add-new");
			row.getElement().classList.add("updated-row");
		} else if (lineItem.isUpdated() && lineItem.isNewlyCreated()) {
			row.getElement().classList.remove("updated-row");
			row.getElement().classList.add("add-new");
		} else if (!lineItem.isUpdated() && !lineItem.isNewlyCreated()) {
			row.getElement().classList.remove("updated-row");
			row.getElement().classList.remove("add-new");
		}
	}

	function updateWaterfallItemCount(count) {
		let html = `<span class="count-waterfall-items">${count} Items</span>`;
		$(".count-waterfall-wrapper").html(html);
	}

	function initAdUnitWaterfallTable() {
    WaterfallTable = new Tabulator("#waterfall-adunit", {
			height: WATERFALL_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			index: "key", // To avoid duplicates in the table
			// tooltips: true,
			// placeholder: placeHolder,
			movableColumns: true,

			// Add new line item at the top
			addRowPos: top,

			// Row Change callbacks
      rowAdded: function(row) { 
				updateWaterfallItemCount(WaterfallTable.getDataCount("active"));
				syncUpWithStore(row, "new");
				addBadge(row);
				console.log("row added");
			},

      rowUpdated: function(row) { 
				updateNumberOfChangeButton();
				syncUpWithStore(row);
				addBadge(row);
				console.log("row updated");
			},

			cellEdited: function(cell) {
				updateNumberOfChangeButton();
				syncUpWithStore(cell.getRow());
				addBadge(cell.getRow());
				console.log("cell edited");
			},

			dataChanged: function(data) {
				updateNumberOfChangeButton();
				// console.log("data changed");
			},

			rowMoved: function(row) {
				//
			},

			rowDeleted: function(row) { 
				console.log(`Line item ${row.getData().name} (${row.getData().key}) Removed`);
				updateWaterfallItemCount(WaterfallTable.getDataCount("active"));
			},

			rowSelectionChanged: function(data, rows) {
				rows.forEach((row) => {
					const rowElementClassList = row.getElement().classList;
					if (rowElementClassList.contains("tabulator-unselectable") && rowElementClassList.contains("tabulator-selected")) {
						row.deselect();
					}
				});
				if (rows.length > 0) {
					controlBtnManager.updateLabels(WaterfallTable.getSelectedRows().length);
				} else if (rows.length == 0) {
					controlBtnManager.updateLabels(0);
				}
			},

			rowSelected: function(row) {
				// row.reformat();				
			},

			rowDeselected: function(row) {
				// row.reformat();				
			},

			dataFiltered: function(filters, rows) {
				updateWaterfallItemCount(rows.length);
			},
		
			// Grouping config
			groupBy: "priority",
			groupToggleElement: true,
			groupHeader: function(value, count, data, group) {
				const html = `Priority ${value}`;
				// let html = `Priority ${value} (${count} line items)`;
				// let html = `Priority <a class="ui blue basic circular label">${value}</a>`;
				return html;
			},

			// Download config
			downloadConfig: {
        columnGroups: false, //include column groups in column headers for download
        rowGroups: false, //do not include row groups in download
        columnCalcs: false, //do not include column calculation rows in download
        dataTree: false, //do not include data tree in download
			},

			// Disable line items that doesn't supported for now.
			selectableCheck: function(row) {
				let status = row.getData().status;
				let type = row.getData().type;

				// let regexStatus = /campaign\-|segment\-|scheduled/;
				let regexStatus = /^running$|^paused$|^archived$/;
				let regexType = /advanced\_|pmp\_|segment/;
				if (!regexStatus.test(status) || regexType.test(type)) {
					// let rowElement = row.getElement();
					// $(rowElement).addClass('tabulator-unselectable');
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

	function initOrderListTable() {
		OrderTable = new Tabulator("#order-table", {
			// height: ORDER_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			placeholder: placeHolder,

			// Pagination
			pagination: "local",
			paginationSize: ORDER_PAGINATION_SIZE,

			rowSelectionChanged: function(data, rows) {
				$(".selected-order-count").html(rows.length);
			},

			rowSelected: function(row) {
				// row.reformat();				
			},

			rowDeselected: function(row) {
				// row.reformat();				
			},

			selectableCheck: function(row) {
				const status = row.getData().status;
				const type = row.getData().type;
				if (!regexSupportedStatus.test(status) || regexUnsupportedType.test(type)) return false;
				return true;
			},
	
			dataLoaded: function(data) {
				const html = `<span class="count-orders">${data.length} Items</span>`;
				$(".count-orders-wrapper").html(html);
			},
			
			dataFiltered: function(filters, rows) {
				const html = `<span class="count-orders">${rows.length} Items</span>`;
				$(".count-orders-wrapper").html(html);
			},

			columns: tableColumnDef.getColumnDef("OrderTable"),

			initialSort:[
				{ column:"name", dir:"desc" }
			],

			// Footer Search
			footerElement: orderSearchInputHtml
		});
	}

	function initABTable() {
		ABTable = new Tabulator("#ab-table", {
			// height: AB_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			// movableRows: true,
			// placeholder: abPlaceHolder,
			columns: tableColumnDef.getColumnDef("ABTable"),

			dataLoaded: function(data) {
				// const html = `<span class="count-orders">${data.length} Items</span>`;
				// $(".count-ab-wrapper").html(html);
			},

			// footerElement: abTableFooterHtml
		});
	}

	function initLineItemListTable() {
		LineItemTable = new Tabulator("#lineitem-table", {
			height: LINEITEM_TABLE_HEIGHT,
			data: [],
			layout: "fitColumns",
			// placeholder: lineItemPlaceHolder,
			index: "key", // To avoid dup in the table
			pagination: "local",
			paginationSize: LINEITEM_PAGINATION_SIZE,

			rowSelectionChanged: function(data, rows) {
				rows.forEach((row) => {
					const rowElementClassList = row.getElement().classList;
					if (rowElementClassList.contains("tabulator-unselectable") && rowElementClassList.contains("tabulator-selected")) {
						row.deselect();
					}
				});
				if (rows.length > 0) {
					$(".selected-line-item-count").html(LineItemTable.getSelectedRows().length);
				} else {
					$(".selected-line-item-count").html(0);
				}
			},

			rowSelected: function(row) {
				// row.reformat();				
			},

			rowDeselected: function(row) {
				// row.reformat();				
			},

			rowAdded: function(row) {
				// let html = `<span class="count-lineitems">${LineItemTable.getDataCount()} Items</span>`;
				// $(".count-lineitems-wrapper").html(html);
			},

			dataLoaded: function(data) {
				const html = `<span class="count-lineitems">${data.length} Items</span>`;
				$(".count-lineitems-wrapper").html(html);
			},

			dataFiltered: function(filters, rows) {
				const html = `<span class="count-lineitems">${rows.length} Items</span>`;
				$(".count-lineitems-wrapper").html(html);
			},

			selectableCheck: function(row) {
				const status = row.getData().status;
				const type = row.getData().type;
				if (!regexSupportedStatus.test(status) || regexUnsupportedType.test(type)) return false;
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

  return {
    init: init,
		getColumnDefinitions: getColumnDefinitions,
		getVisibleColumns: getVisibleColumns
  }
})(this);
