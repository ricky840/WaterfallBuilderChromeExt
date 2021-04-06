var tableColumnDef = (function(global) {
  "use strict";

	// let titleCheckBoxWB =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="waterfall"><label></label></div>`;
	const titleCheckBoxOrder =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="order"><label></label></div>`;
	const titleCheckBoxLineItem =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="lineitem"><label></label></div>`;

	// Alias for formatters
	const f = tableFormatters;

	// Waterfall Table Def
	const waterfallColumns = [
		{ titleFormatter: "rowSelection", resizable: false, headerSort: false, width: 30, formatter: "rowSelection", hozAlign: "center" },
		{ field: 'name', title: 'Name', visible: true, download: true, editor: "input", editable: editCheck, cellEdited: nameValidator, formatter: f.nameFormatter },
		{ field: 'key', title: 'Key', visible: false, download: true, sorter: 'string', formatter: f.lineItemKeyFormatter },
		{ field: 'orderName', title: 'Order', visible: false, download: true },
		{ field: 'orderKey', title: 'Order Key', visible: false, download: true },
		{ field: 'type', title: 'Type', visible: true, download: true, sorter: 'string', formatter: f.lineItemTypeFormatter, width: 120 },
		{ field: 'networkType', title: 'Network Type', visible: false, download: true, sorter: 'string', formatter: f.networkTypeNameFormatter },
		{ field: 'overrideFields', title: 'Override Fields', download: true, formatter: f.overrideFieldFormatter, visible: true, sorter: 'string', cellClick: editOverrideFields },

		// New Fields
		{ field: 'disallowAutoCpm', title: 'Disallow AutoCPM', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'adUnitKeys', title: 'Assigned AdUnits', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'enableOverrides', title: 'Enable Overrides', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'budgetStrategy', title: 'Budget Strategy', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'targetedCarriers', title: 'Carriers', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'frequencyCapsEnabled', title: 'FrequencyCap Enabled', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'allocationPercentage', title: 'Allocation Percentage', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'refreshInterval', title: 'Refresh Interval', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'userAppsTargeting', title: 'UserApps Targeting', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },
		{ field: 'userAppsTargetingList', title: 'UserApps TargetingList', download: true, formatter: f.jsonArrayFormatter, sorter: 'string', visible: false },

		{ field: 'includeGeoTargeting', title: 'GeoTarget Mode', visible: true, download: true, sorter: 'string', formatter: f.geoTargetModeFormatter, cellClick: editForm, width: 100 },
		{ field: 'targetedCountries', title: 'Countries', visible: true, download: true, formatter: f.jsonArrayFormatter, sorter: 'string', cellClick: editForm },
		{ field: 'targetedRegions', title: 'Regions', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedCities', title: 'Cities', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedZipCodes', title: 'ZipCodes', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'keywords', title: 'Keywords', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string', cellClick: editForm },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, download: true, editor: "number", editable: editCheck, 
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
		{ field: 'status', title: 'Status', visible: true, download: true, editor: "select", editable: editCheck, editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[{ label: "Running", value: "running" }, { label: "Paused", value: "paused" }, {label: "Archived", value: "archived"}]
			},
			formatter: f.statusFormatter,
			width: 150,
			minWidth: 150
		},
		{ field: 'priority', title: 'Priority', visible: true, download: true, editor: "number", editable: editCheck, editorParams: {
				min: 1,
				max: 16,
				step: 1,
				width: 100,
				elementAttributes:{
					maxlength: "2", //set the maximum character length of the input element to 10 characters
				}
			},
			validator: ["required", "min:1", "max:16"],
			sorter: "number",
			cellEdited: function(cell) {
				this.setSort([
					{ column: "bid", dir:"desc" },
					{ column: 'priority', dir:"asc" }
				]);
			},
			hozAlign: "left",
			minWidth: 90,
			width: 90,
			formatter: f.priorityFormatter
		},
		{ field: 'start', title: 'Start', visible: false, download: true, sorter: 'string' },
		{ field: 'end', title: 'End', visible: false, download: true, sorter: 'string' },
		{ field: 'autoCpm', title: 'AutoCPM', visible: false, download: true, sorter: 'string', formatter: f.jsonArrayFormatter },
		{ field: 'budget', title: 'Budget', visible: false, download: true, sorter: 'string' },
		{ field: 'budgetType', title: 'Budget Type', visible: false, download: true, sorter: 'string' },
		{ field: 'frequencyCaps', title: 'Frequency Caps', visible: false, download: true, sorter: 'string', formatter: f.jsonArrayFormatter },
	];

	let lineitemColumns = [
		{ rowHandle: true, formatter: "handle", headerSort: false, width: 30, minWidth: 30 },
		{ title: titleCheckBoxLineItem, resizable: false, headerSort: false, width: 30, formatter: f.checkBoxFormatter,	cellClick: checkBoxClick },
		{ field: 'name', title: 'Name', visible: true, minWidth: 100, formatter: f.lineItemNameFormatter },
		{ field: 'key', title: 'Key', visible: false },
		{ field: 'type', title: 'Type', visible: true, minWidth: 110, width: 110, formatter: f.lineItemTypeFormatter },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, minWidth: 100, width: 100, formatter: f.cpmFormatterNotEditable },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: f.statusFormatterNotEditable },
		{ field: 'priority', title: 'Priority', visible: true, width: 90, formatter: f.priorityFormatterNotEditable },
		{ field: 'networkType', title: 'Network Type', visible: false },
		{ field: 'orderName', title: 'orderName', visible: false },
	];

  let orderColumns = [
		{ titleFormatter: "rowSelection", resizable: false, headerSort: false, width: 30, formatter: "rowSelection", hozAlign: "center" },
		{ field: 'name', title: 'Name', visible: true, formatter: f.orderNameFormatter },
		{ field: 'key', title: 'Key', visible: false },
		{ field: 'description', title: 'Description', visible: true },
		{ field: 'advertiser', title: 'Advertiser', visible: true },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: f.statusFormatterNotEditable },
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
			default:
				break;
		}
	}

	function editCheck(cell) {
		let rowData = cell.getRow().getData();
		let field = cell.getColumn().getField();
		// For default "marketplace", users only should be able to change CPM and status field.
		if (rowData.type == "marketplace") {
			if (field != "bid" && field != "status") {
				console.log("Marketplace line item - the field is not editable");
				chrome.runtime.sendMessage({type: "chromeNotification", title: "Field not editable", message: "Only cpm and status is editable for the default Marketplace line item"});
				return false;
			}
		}
		return true;
	}

	function nameValidator(cell) {
		// if no name was entered, restore the previous value
		let value = cell.getValue().trim();
		if (_.isEmpty(value)) {
			cell.restoreOldValue();
			return true;
		}
	}

	function checkBoxClick(e, cell) {
		$(cell.getElement()).find("input").is(':checked') ? cell.getRow().select() : cell.getRow().deselect();
	}

	function editOverrideFields(e, cell) {
		let value = clearEmpties(cell.getValue());
		if (_.isEmpty(value)) return false;
		let rowData = cell.getData();
		if (rowData["networkType"] == "custom_html") return false; 

		$('.ui.modal.edit-overridefields-modal').modal({
			duration: 300,
			onShow: function() {
				let html = editFormManager.createNetworkFieldForm(rowData["networkType"], cell.getValue());
				let title = `<a class="ui label title-override-label">${NETWORK_TYPE_NAME[rowData["networkType"]]}</a>`;
				title += `<span>${rowData["name"]}</span>`;
				$("#network-type-title").html(title);
				$("#network-fields").html(html);	
			},
			onApprove: function(element) {
				return editFormManager.updateNetworkInput(rowData);
			},
			onHidden: function() {
				notifier.clearEditNetworkForm();
			}
		}).modal('show');
	}

	function editForm(e, cell) {
		let row = cell.getRow();
		let rowData = row.getData();
		let selectedRows = WaterfallTable.getSelectedRows();
		if (rowData.type == "marketplace") return false;	

		WaterfallTable.deselectRow();
		for (let i=0; i < selectedRows.length; i++) {
			selectedRows[i].reformat(); // trigger render event
		}
		$(".select-all").prop("checked", false);

		row.select();
		editFormManager.resetForm();

		$('.ui.modal.edit-modal').modal({
			duration: 300,
			autofocus: false,
			onShow: function() {
				editFormManager.fillRowInfo(rowData);
			}
		}).modal('show');
	}

  return {
		getColumnDef: getColumnDef
  }

})(this);










