var tableInitializer = (function(global) {
  "use strict";

	let placeHolder = `<br><h4 class="ui header grey">No Data Available</h4><br><br><br>`;

	function init() {
		initAdUnitWaterfallTable();
		initOrderListTable();
		initLineItemListTable();
	}

	function jsonArrayFormatter(cell, formatterParams, onRendered) {
		let value = cell.getValue();
		if (jQuery.type(value) == "object") {
			value = JSON.stringify(value, null, 2);
		} else if (jQuery.type(value) == "array") {
			value = value.toString();
		}
		return value;
	}

	function editCheck(cell) {
		let rowData = cell.getRow().getData();
		let field = cell.getColumn().getField();

		// For default "marketplace", users only should be able to change CPM and status field.
		if (rowData.type == "marketplace") {
			if (field != "bid" && field != "status") {
				console.log("This field is not editable");
				return false;
			}
		}
		return true;
	}

	function initAdUnitWaterfallTable() {
    WaterfallTable = new Tabulator("#waterfall-adunit", {
			data: [],
			layout: "fitColumns",
			index: "key", // To avoid duplicate in the table
			tooltips: true,
			placeholder: placeHolder,
			rowAdded: function(row) {
				let rowElement = row.getElement();
				$(rowElement).addClass("flash");
				$("#status-filter").trigger('change');
				WaterfallTable.setSort([
					{ column: "bid", dir:"desc" },
					{ column: 'priority', dir:"asc" }
				]);
			},

			// Manage Row Movement
			movableRows: true,
			movableRowsReceivingStart: function(fromRow, fromTable) {
				let rowData = fromRow.getData();
				rowData['secondaryName'] = rowData.orderName;
		  },
			movableRowsReceiver: function(fromRow, toRow, fromTable) {
				let insertData = fromRow.getData();
				if (!insertData.adUnitKeys.includes(AdUnitId)) {
					insertData.adUnitKeys.push(AdUnitId); // Connect to New AdUnit #Important!. AdUnitId is global var
				}
				WaterfallTable.updateOrAddData([insertData]);
				return true;
			},
		
			// Grouping config
			groupBy: "priority",
			groupToggleElement: false,
			groupHeader: function(value, count, data, group) {
				return "Priority " + value;
			},
			
			// Column Definition
			columns: [
				{ rowHandle: true, formatter: "handle", headerSort: false, resizable: false, width: 30, minWidth: 30 },
				{ formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, resizable: false, cellClick: function(e, cell) {
						cell.getRow().toggleSelect();
					},
					width: 5
				},
				{ field: 'name', title: 'Name', visible: true, download: true, editor: "input", editable: editCheck, minWidth: 80 },
				{ field: 'type', title: 'Item Type', visible: true, download: true, minWidth: 110, width: 110 },
				{ field: 'networkType', title: 'Network Type', visible: true, download: true, minWidth: 150, width: 150 },
				{ field: 'bid', title: 'CPM', sorter: "number", visible: true, download: true, editor: "number", editable: editCheck, editorParams: {
						min: 0,
						max: 5000,
						step: 1,
						elementAttributes: {
							maxlength: "10"
						}
					},
					formatter: "money",
					formatterParams:{
						symbol: "$ "
					},
					cellEdited: function(cell) {
						this.setSort([
							{ column: "bid", dir: "desc" }, //then sort by this second
							{ column: 'priority', dir: "asc" } //sort by this first
						]);
					},
					minWidth: 100,
					width: 100
				},
				{ field: 'priority', title: 'Priority', visible: true, download: true, editor: "number", editable: editCheck, editorParams: {
						min: 1,
						max: 16,
						step: 1,
						elementAttributes:{
							maxlength: "2", //set the maximum character length of the input element to 10 characters
						},
						verticalNavigation: "table",
					},
					validator: ["required", "min:1", "max:16"],
					sorter: "number",
					cellEdited: function(cell) {
						this.setSort([
							{ column: "bid", dir:"desc" },
							{ column: 'priority', dir:"asc" }
						]);
					},
					align: "left",
					minWidth: 90,
					width: 90
				},
				{ field: 'status', title: 'Status', visible: true, download: true, editor: "select", editable: editCheck, editorParams: {
						values: [
							{ label: "Running", value: "running" }, 
							{ label: "Paused", value: "paused" }
						]
					},
					width: 90,
					minWidth: 90
				},
				{ field: 'secondaryName', title: 'Order', visible: true, download: true, minWidth: 80 },
				{ field: 'network', title: 'Network', visible: false, download: true, formatter: jsonArrayFormatter },
				{ field: 'overrideFields', title: 'Override Fields', download: true, formatter: jsonArrayFormatter, visible: false },
				{ field: 'start', title: 'Start', visible: false, download: true },
				{ field: 'end', title: 'End', visible: false, download: true },
				{ field: 'active', title: 'Active', visible: false, download: true },
				{ field: 'disabled', title: 'Disabled', visible: false, download: true },
				{ field: 'keywords', title: 'Keywords', visible: false, download: true },
				{ field: 'includeGeoTargeting', title: 'Geo Targeting Mode', visible: false, download: true },
				{ field: 'countries', title: 'Countries', visible: false, download: true },
				{ field: 'regions', title: 'Regions', visible: false, download: true },
				{ field: 'cities', title: 'Cities', visible: false, download: true },
				{ field: 'zipCodes', title: 'ZipCodes', visible: false, download: true },
				{ field: 'autoCpm', title: 'AutoCpm', visible: false, download: true },
				{ field: 'key', title: 'Key', visible: false, download: true },
				{ field: 'budget', title: 'Budget', visible: false, download: true },
				{ field: 'budgetType', title: 'Budget Type', visible: false, download: true },
				{ field: 'pacing', title: 'Pacing', visible: false, download: true },
				{ field: 'frequencyCaps', title: 'Frequency Caps', visible: false, download: true },
				{ field: 'bidStrategy', title: 'Bid Strategy', visible: false, download: true },
				{ field: 'percentDelivered', title: 'Percent Delivered', visible: false, download: true },
			],
			initialSort: [
				{ column:"bid", dir:"desc" },
				{ column:"priority", dir:"asc" }
			],
			rowMoved: function(row) {
				this.setSort([
					{ column: "bid", dir:"desc" },
					{ column: 'priority', dir:"asc" }
				]);
			}
		});
	}

	function initLineItemListTable() {
		LineItemTable = new Tabulator("#lineitem-list", {
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
			paginationSize: 15,

			// Column Definition
			columns: [
				{ rowHandle:true, formatter: "handle", headerSort: false, width: 30, minWidth: 30 },
				{ formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, resizable: false, cellClick: function(e, cell) {
						cell.getRow().toggleSelect();
					},
          width: 5
				},
				{ field: 'name', title: 'Name', visible: true, minWidth: 100 },
				{ field: 'type', title: 'Type', visible: true },
				{ field: 'priority', title: 'Priority', visible: true },
				{ field: 'bid', title: 'CPM', sorter: "number", visible: true, formatter: "money", formatterParams: {symbol: "$ "} },
				{ field: 'status', title: 'Status', visible: true },
				{ field: 'orderName', title: 'Order', visible: true },
				{ field: 'key', title: 'Key', visible: false }
			],

			// Initial Sort
			initialSort:[
				// { column:"activeLineItemCount", dir:"desc" }
			]
		});
	}

	function initOrderListTable() {
		OrderTable = new Tabulator("#order-list", {
			data: [],
			layout: "fitColumns",
			selectable: true,
			tooltips: true,
			placeholder: placeHolder,

			// Pagination
			pagination: "local",
			paginationSize: 10,

			columns: [
				{ formatter:"rowSelection", titleFormatter: "rowSelection", headerSort: false, resizable: false, cellClick: function(e, cell) {
						cell.getRow().toggleSelect();
					},
          width: 5
				},
				{ field: 'name', title: 'Order', visible: true },
				{ field: 'lineItemCount', title: 'Total', visible: true, minWidth: 90, width: 90 },
				{ field: 'activeLineItemCount', title: 'Active', visible: true, minWidth: 90, width: 90 },
				{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90 },
				{ field: 'key', title: 'Key', visible: false },
				{ field: 'description', title: 'Description', visible: false }
			],
			initialSort:[
				{ column:"activeLineItemCount", dir:"desc" }
			]
		});
	}

  return {
    init: init
  }
})(this);
