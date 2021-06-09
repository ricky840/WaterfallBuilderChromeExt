var tableColumnDef = (function(global) {
  "use strict";

	// Alias for formatters
	const f = tableFormatters;

	// Waterfall Table Def
	const waterfallColumns = [
		// Checkbox
		{
			titleFormatter: "rowSelection", 
			resizable: false, 
			headerSort: false, 
			width: 30, 
			download: false, 
			formatter: "rowSelection", 
			hozAlign: "center",
			titleFormatterParams: {
				rowRange: "active"
			}
		},
		// Name field (string)
		{ 
			field: 'name', 
			title: 'Name', 
			visible: false, 
			download: true, 
			editor: "input", 
			editable: isEditable, 
			cellEdited: nameValidator, 
			formatter: f.nameFormatter 
		},
		// Key field (string)
		{ 
			field: 'key', 
			title: 'Key', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.lineItemKeyFormatter 
		},
		// Ordername field (string)
		{ 
			field: 'orderName', 
			title: 'Order', 
			visible: false, 
			download: true
		},
		// Orderkey field (string)
		{ 
			field: 'orderKey', 
			title: 'Order Key', 
			visible: false, 
			download: true 
		},
		// Type field (string)
		{ 
			field: 'type', 
			title: 'Type', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.lineItemTypeFormatter, 
			width: 120 
		},
		// Network type field (string)
		{ 
			field: 'networkType', 
			title: 'Network Type', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.networkTypeNameFormatter 
		},
		// OverrideField field (object)
		{ 
			field: 'overrideFields', 
			title: 'Override Fields', 
			download: true, 
			formatter: f.overrideFieldFormatter, 
			visible: false, 
			sorter: 'string', 
			cellClick: showEditModal
		},
		// Idfa Targeting field (string)
		{ 
			field: 'idfaTargeting', 
			title: 'IDFA Targeting', 
			visible: false, 
			download: true, 
			editor: "select", 
			editable: isEditable,
			editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[
					{ label: "All", value: "all" },
					{ label: "Only IDFA", value: "only_idfa" },
					{ label: "No IDFA", value: "no_idfa" }
				]
			},
			sorter: 'string', 
			formatter: f.idfaTargetingFormatter,
			width: 130
		},
		// DisallowAutoCpm field (boolean)
		{ 
			field: 'disallowAutoCpm', 
			title: 'Disallow AutoCPM', 
			download: true, 
			editor: "select", 
			editable: isEditable,
			editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[
					{ label: "True", value: true },
					{ label: "False", value: false },
				]
			},
			formatter: f.disallowAutoCpmFormatter,
			visible: false
		},
		// AdUnitKeys field	(string array)
		{ 
			field: 'adUnitKeys', 
			title: 'Assigned AdUnits', 
			download: true, 
			sorter: 'string', 
			visible: false,
			formatter: f.adUnitKeysFormatter, 
			cellClick: showEditModal,
		},
		// Enable override field (boolean)
		{ 
			field: 'enableOverrides', 
			title: 'Enable Overrides', 
			download: true, 
			formatter: f.booleanFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Budget strategy field (string)
		{ 
			field: 'budgetStrategy', 
			title: 'Budget Strategy', 
			download: true, 
			formatter: f.stringFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Targeted carrieers field (string array)
		{ 
			field: 'targetedCarriers', 
			title: 'Targeted Carriers', 
			download: true, 
			formatter: f.stringArrayFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Frequencycaps enabled (boolean)
		{ 
			field: 'frequencyCapsEnabled', 
			title: 'FrequencyCap Enabled', 
			download: true, 
			formatter: f.booleanFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Allowcation percentage (int)
		{ 
			field: 'allocationPercentage', 
			title: 'Allocation Percentage', 
			download: true, 
			formatter: f.percentageFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Refresh interval field (int)
		{ 
			field: 'refreshInterval', 
			title: 'Refresh Interval', 
			download: true, 
			formatter: f.secondFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// UserApps targeting (string)
		{ 
			field: 'userAppsTargeting', 
			title: 'UserApps Targeting', 
			download: true, 
			formatter: f.stringFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// UserApps targeting list (string array)
		{ 
			field: 'userAppsTargetingList', 
			title: 'UserApps TargetingList', 
			download: true, 
			formatter: f.stringArrayFormatter, 
			sorter: 'string', 
			visible: false 
		},
		// Include geo targeting field (string)
		{ 
			field: 'includeGeoTargeting', 
			title: 'GeoTarget Mode', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.geoTargetModeFormatter, 
			cellClick: showEditModal,
			width: 100 
		},
		// Targeted country (string array)
		{ 
			field: 'targetedCountries', 
			title: 'Countries', 
			visible: false, 
			download: true, 
			formatter: f.labelListFormatter, 
			sorter: 'string', 
			cellClick: showEditModal 
		},
		// Targeted regions (string array)
		{ 
			field: 'targetedRegions', 
			title: 'Regions', 
			visible: false, 
			download: true, 
			formatter: f.labelListFormatter, 
			sorter: 'string' 
		},
		// Targeted cities (string array)
		{ 
			field: 'targetedCities', 
			title: 'Cities', 
			visible: false, 
			download: true, 
			formatter: f.labelListFormatter, 
			sorter: 'string' 
		},
		// Targeted zip codes (string array)
		{ 
			field: 'targetedZipCodes', 
			title: 'ZipCodes', 
			visible: false, 
			download: true, 
			formatter: f.labelListFormatter, 
			sorter: 'string' 
		},
		// Keywords field (string array)
		{ 
			field: 'keywords', 
			title: 'Keywords', 
			visible: false, 
			download: true, 
			formatter: f.labelListFormatter, 
			sorter: 'string', 
			cellClick: showEditModal
		},
		// Bid field (double)
		{ 
			field: 'bid', 
			title: 'CPM', 
			sorter: "number", 
			visible: false, 
			download: true, 
			editor: "number", 
			editable: isEditable, 
			editorParams: {
				min: 0,
				max: 9999,
				step: 1,
				elementAttributes: { maxlength: "7" }
			},
			validator: ["required", "min:0.01", "max:9999"],
			formatter: f.cpmFormatter,
			minWidth: 100,
			width: 100
		},
		// Status field (string)
		{ 
			field: 'status', 
			title: 'Status', 
			visible: false, 
			download: true, 
			editor: "select", 
			editable: isEditable, 
			editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[
					{ label: "Running", value: "running" },
					{ label: "Paused", value: "paused" },
					{ label: "Archived", value: "archived" }
				]
			},
			formatter: f.statusFormatter,
			width: 150,
			minWidth: 150
		},
		// Priority field (int)
		{ 
			field: 'priority', 
			title: 'Priority', 
			visible: false, 
			download: true, 
			editor: "number", 
			editable: isEditable, 
			editorParams: {
				min: 1,
				max: 16,
				step: 1,
				width: 100,
				elementAttributes: {
					maxlength: "2", // set the maximum character length of the input element to 10 characters
				}
			},
			validator: ["required", "min:1", "max:16"],
			sorter: "number",
			cellEdited: function(cell) {
				this.setSort([
					{ column: "bid", dir: "desc" },
					{ column: 'priority', dir: "asc" }
				]);
			},
			hozAlign: "left",
			minWidth: 90,
			width: 90,
			formatter: f.priorityFormatter
		},
		// Start field (Time format - string)
		{ 
			field: 'start', 
			title: 'Start', 
			visible: false, 
			download: true, 
			sorter: 'string'
		},
		// End field (Time format - string)
		{ 
			field: 'end',
			title: 'End', 
			visible: false, 
			download: true, 
			sorter: 'string'
		},
		// Autocpm field (double)
		{ 
			field: 'autoCpm', 
			title: 'AutoCPM', 
			visible: false, 
			download: true, 
			sorter: 'string' 
		},
		// Budget field (string)
		{ 
			field: 'budget', 
			title: 'Budget', 
			visible: false, 
			download: true, 
			sorter: 'string',
			formatter: f.stringFormatter 
		},
		// Budget type field (string)
		{ 
			field: 'budgetType', 
			title: 'Budget Type', 
			visible: false, 
			download: true, 
			sorter: 'string',
			formatter: f.stringFormatter 
		},
		// Frequency caps field (string array) [{"cap":20,"duration":"hour","numDuration":1}]
		{ 
			field: 'frequencyCaps', 
			title: 'Frequency Caps', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.frequencyCapsFormatter 
		},
		// Advertiser field (string)
		{ 
			field: 'advertiser', 
			title: 'Advertiser', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.stringFormatter 
		},
		// Daypart targeting field (string)
		{ 
			field: 'dayPartTargeting', 
			title: 'DayPart Targeting', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.stringFormatter 
		},
		// Dayparts field (string)
		{ 
			field: 'dayParts', 
			title: 'DayParts', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.stringFormatter 
		},
		// Device targeting field (boolean)
		{ 
			field: 'deviceTargeting', 
			title: 'Device Targeting', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Max android version field (int)
		{ 
			field: 'maxAndroidVersion', 
			title: 'Max Android Version', 
			visible: false, 
			download: true, 
			sorter: 'string'
		},
		// Min android version field (double)
		{ 
			field: 'minAndroidVersion', 
			title: 'Min Android Version', 
			visible: false, 
			download: true, 
			sorter: 'string' 
		},
		// Max ios version field (int)
		{ 
			field: 'maxIosVersion', 
			title: 'Max iOS Version', 
			visible: false, 
			download: true, 
			sorter: 'string' 
		},
		// Min ios version field (double)
		{ 
			field: 'minIosVersion', 
			title: 'Min iOS Version', 
			visible: false, 
			download: true, 
			sorter: 'string' 
		},
		// Target android field (boolean)
		{ 
			field: 'targetAndroid', 
			title: 'Target Android', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Target ios field (boolean)
		{ 
			field: 'targetIos', 
			title: 'Target iOS', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Target iphone field (boolean)
		{ 
			field: 'targetIphone', 
			title: 'Target iPhone', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Target ipad field (boolean)
		{ 
			field: 'targetIpad', 
			title: 'Target iPad', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Target ipod field (boolean)
		{ 
			field: 'targetIpod', 
			title: 'Target iPod', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.booleanFormatter 
		},
		// Include connectivity targeting field (string)
		{ 
			field: 'includeConnectivityTargeting', 
			title: 'Include Connectivity Targeting', 
			visible: false, 
			download: true, 
			sorter: 'string', 
			formatter: f.stringFormatter 
		},
	];

	const lineitemColumns = waterfallColumns;

  const orderColumns = [
		{ 
			titleFormatter: "rowSelection",
			resizable: false,
			headerSort: false,
			width: 30,
			formatter: "rowSelection",
			hozAlign: "center",
			titleFormatterParams: {
				rowRange: "active"
			}
		},
		{ 
			field: 'name',
			title: 'Order Name',
			visible: true,
			formatter: f.orderNameFormatter
		},
		{ 
			field: 'key',
			title: 'Key',
			visible: false
		},
		{
			field: 'description',
			title: 'Description',
			visible: true
		},
		{
			field: 'advertiser',
			title: 'Advertiser',
			visible: true 
		},
		{
			field: 'status',
			title: 'Status',
			visible: true,
			minWidth: 90,
			width: 90,
			formatter: f.statusFormatter
		},
	];

	const abColumns = [
		/**
		 * Tara wanted to remove the handle.
		 */
		// {
		// 	rowHandle: true,
		// 	headerSort: false, 
		// 	formatter: "handle",
		// 	width: 35,
		// 	maxWidth: 35,
		// 	minWidth: 35,
		// 	frozen: true
		// },
		// Network Type (string)
		{ 
			field: 'networkType',
			title: 'Advanced Bidding Network',
			visible: true,
			download: true, 
			sorter: 'string',
			maxWidth: 300,
			formatter: f.abNameFormatter
		},
		// OverrideField field (object)
		{ 
			field: 'overrideFields', 
			title: 'Network IDs', 
			download: true, 
			visible: true, 
			sorter: 'string',
			formatter: f.objectFormatter
		},
		// Priority field (int)
		{ 
			field: 'priority', 
			title: 'Priority', 
			visible: true, 
			download: true, 
			sorter: "number",
			maxWidth: 120,
			minWidth: 120,
			formatter: f.priorityFormatterNotEditable
		},
		// Boolean
		{
			formatter:"tickCross", 
			field: 'enabled',
			title: 'Enabled',
			visible: true,
			download: true,
			maxWidth: 120,
			minWidth: 120,
			sorter: "boolean"
		}
	];

	function getColumnDef(table) {
		switch(table) {
			case "WaterfallTable":
				return waterfallColumns;
				break;
			case "OrderTable":
				return orderColumns;
				break;
			case "LineItemTable":
				return lineitemColumns;
				break;
			case "ABTable":
				return abColumns;
				break;
			default:
				break;
		}
	}

	function nameValidator(cell) {
		// if no name was entered, restore the previous value
		let value = cell.getValue().trim();
		if (_.isEmpty(value)) {
			cell.restoreOldValue();
			return true;
		}
	}

	function isEditable(cell) {
		// Cells in line item table is not editable. This is for inline editing.
		const table = cell.getTable();
		if (table.element.id == "lineitem-table") return false;
		return true;
	}

	// Show edit modal
	function showEditModal(event, cell) {
		// Cells in the line item table is not clickable
		const table = cell.getTable();
		if (table.element.id == "lineitem-table") return false;

		const field = cell.getColumn().getField();
		switch(field) {
			case "overrideFields":
				editOverrideFields(cell);
				break;
			default:
				editForm(cell);
		}
	}

	function editOverrideFields(cell) {
		let value = clearEmpties(cell.getValue());
		if (_.isEmpty(value)) value = {};

		const rowData = cell.getData();
		if (rowData["networkType"] == "custom" || rowData["type"] != "network") return false; 

		const row = cell.getRow();

		$('.ui.modal.edit-overridefields-modal').modal({
			duration: 300,
			onShow: function() {
				const html = editFormManager.createNetworkFieldForm(rowData["networkType"], value);
				const title = `
					<a class="ui label title-override-label">${NETWORK_TYPE_NAME[rowData["networkType"]]}</a>
					<span>${rowData["name"]}</span>`;
				$("#network-type-title").html(title);
				$("#network-fields").html(html);	
			},
			onApprove: function(element) {
				row.reformat();
				return editFormManager.updateNetworkInput(rowData);
			}
		}).modal('show');
	}

	function editForm(cell) {
		cell.getRow().select();
		$(".control-btn-edit").trigger("click");
	}

	/**
	 * Table search filter target columns
	 */

	function getFilterTargetColsDef(tableName, value) {
		if (tableName == "WaterfallTable" || tableName == "LineItemTable") {
			return [
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
		} else if (tableName == "OrderTable") {
			return [
				{ field: "name", type: "like", value },
				{ field: "key", type: "like", value }
			];
		}
	}

  return {
		getColumnDef: getColumnDef,
		getFilterTargetColsDef: getFilterTargetColsDef
  }

})(this);










