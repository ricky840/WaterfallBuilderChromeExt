var tableColumnDef = (function(global) {
  "use strict";

	let titleCheckBoxWB =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="waterfall"><label></label></div>`;
	let titleCheckBoxOrder =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="order"><label></label></div>`;
	let titleCheckBoxLineItem =`<div class='ui checkbox fitted'><input class="select-all" type='checkbox' table="lineitem"><label></label></div>`;

	// Alias for formatters
	let f = tableFormatters;

	// Waterfall Table Def
	let waterfallColumns = [
		{ rowHandle: true, formatter: "handle", headerSort: false, resizable: false, width: 30, minWidth: 30 },
		{ title: titleCheckBoxWB, resizable: false, headerSort: false, width: 30, formatter: f.checkBoxFormatter, cellClick: checkBoxClick },
		{ field: 'name', title: 'Name', visible: true, download: true, editor: "input", editable: editCheck, minWidth: 80, formatter: f.nameFormatter },
		{ field: 'key', title: 'Key', visible: false, download: true, sorter: 'string' },
		{ field: 'orderName', title: 'Order', visible: false, download: true, minWidth: 80 },
		// { field: 'orderKey', title: 'Order Key', visible: false, download: true },
		{ field: 'type', title: 'Item Type', visible: true, download: true, minWidth: 110, width: 110, formatter: f.lineItemTypeFormatter },
		{ field: 'networkType', title: 'Network Type', visible: false, download: true, minWidth: 150, width: 150, formatter: f.networkTypeNameFormatter },
		{ field: 'network', title: 'Network', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'overrideFields', title: 'Override Fields', download: true, formatter: f.jsonArrayFormatter, visible: true, sorter: 'string', cellClick: editOverrideFields },
		{ field: 'includeGeoTargeting', title: 'Geo Targeting Mode', visible: true, download: true, width: 165, formatter: f.geoTargetModeFormatter, cellClick: editForm },
		{ field: 'targetedCountries', title: 'Countries', visible: true, download: true, formatter: f.jsonArrayFormatter, sorter: 'string', cellClick: editForm },
		{ field: 'targetedRegions', title: 'Regions', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedCities', title: 'Cities', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedZipCodes', title: 'ZipCodes', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'keywords', title: 'Keywords', visible: false, download: true, formatter: f.jsonArrayFormatter, sorter: 'string' },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, download: true, editor: "number", editable: editCheck, 
			editorParams: {
				min: 0,
				max: 9999,
				step: 1,
				elementAttributes: { maxlength: "7" }
			},
			validator: ["required", "min:0.01", "max:9999"],
			formatter: f.cpmFormatter,
			cellEdited: function(cell) {
				this.setSort([
					{ column: "bid", dir: "desc" }, //then sort by this second
					{ column: "priority", dir: "asc" } //sort by this first
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
			align: "left",
			minWidth: 90,
			width: 90,
			formatter: f.priorityFormatter
		},
		{ field: 'start', title: 'Start', visible: false, download: true, sorter: 'string' },
		{ field: 'end', title: 'End', visible: false, download: true, sorter: 'string' },
		{ field: 'active', title: 'Active', visible: false, download: true, sorter: 'string' },
		{ field: 'disabled', title: 'Disabled', visible: false, download: true, sorter: 'string' },
		{ field: 'autoCpm', title: 'AutoCpm', visible: false, download: true, sorter: 'string' },
		{ field: 'budget', title: 'Budget', visible: false, download: true, sorter: 'string' },
		{ field: 'budgetType', title: 'Budget Type', visible: false, download: true, sorter: 'string' },
		{ field: 'frequencyCaps', title: 'Frequency Caps', visible: false, download: true, sorter: 'string' },
		{ field: 'bidStrategy', title: 'Bid Strategy', visible: false, download: true, sorter: 'string' },
		{ field: 'status', title: 'Status', visible: true, download: true, editor: "select", editable: editCheck, editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[{ label: "Running", value: "running" }, { label: "Paused", value: "paused" }, {label: "Archived", value: "archived"}]
			},
			formatter: f.statusFormatter,
			width: 90,
			minWidth: 90
		},
	];

	let lineitemColumns = [
		{ rowHandle: true, formatter: "handle", headerSort: false, width: 30, minWidth: 30 },
		{ title: titleCheckBoxLineItem, resizable: false, headerSort: false, width: 30, formatter: f.checkBoxFormatter,	cellClick: checkBoxClick },
		{ field: 'name', title: 'Name', visible: true, minWidth: 100, formatter: f.lineItemNameFormatter },
		{ field: 'type', title: 'Type', visible: true, minWidth: 110, width: 110, formatter: f.lineItemTypeFormatter },
		{ field: 'priority', title: 'Priority', visible: true, width: 90, formatter: f.priorityFormatterNotEditable },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, minWidth: 100, width: 100, formatter: f.cpmFormatterNotEditable },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: f.statusFormatterNotEditable },
		{ field: 'networkType', title: 'Network Type', visible: false },
		{ field: 'key', title: 'Key', visible: false },
		{ field: 'orderName', title: 'orderName', visible: false }
	];

  let orderColumns = [
		{ title: titleCheckBoxOrder, resizable: false, headerSort: false, width: 30, formatter: f.checkBoxFormatter, cellClick: checkBoxClick},
		{ field: 'name', title: 'Order', visible: true, formatter: f.orderNameFormatter },
		{ field: 'lineItemCount', title: 'Total', visible: true, sorter: "number", minWidth: 90, width: 90 },
		{ field: 'activeLineItemCount', title: 'Active', sorter: "number", visible: true, minWidth: 90, width: 90 },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: f.statusFormatterNotEditable },
		{ field: 'key', title: 'Key', visible: false },
		{ field: 'description', title: 'Description', visible: false }
	];

	function editCheck(cell) {
		let rowData = cell.getRow().getData();
		let field = cell.getColumn().getField();
		// For default "marketplace", users only should be able to change CPM and status field.
		if (rowData.type == "marketplace") {
			if (field != "bid" && field != "status") {
				console.log("Marketplace line item - the field is not editable");
				return false;
			}
		}
		return true;
	}

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
		if (rowData.type == "marketplace") return false;	
		WaterfallTable.deselectRow();
		row.select();
		$('.ui.modal.edit-modal').modal({
			duration: 300,
			autofocus: false,
			onHide: function() {
				row.deselect();
				row.reformat();
			}
		}).modal('show');
	}

  return {
		getColumnDef: getColumnDef
  }

})(this);










