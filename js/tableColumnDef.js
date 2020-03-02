var tableColumnDef = (function(global) {
  "use strict";

	let waterfallColumns = [
		{ rowHandle: true, formatter: "handle", headerSort: false, resizable: false, width: 30, minWidth: 30 },
		{ formatter: "rowSelection", titleFormatter: "", headerSort: false, resizable: false, width: 5, cellClick: function(e, cell) {
				cell.getRow().toggleSelect();
			}
		},
		{ field: 'name', title: 'Name', visible: true, download: true, editor: "input", editable: editCheck, minWidth: 80, formatter: nameFormatter },
		{ field: 'orderName', title: 'Order', visible: true, download: true, minWidth: 80 },
		{ field: 'type', title: 'Item Type', visible: true, download: true, minWidth: 110, width: 110, formatter: typeNameFormatter },
		{ field: 'networkType', title: 'Network Type', visible: true, download: true, minWidth: 150, width: 150, formatter: networkTypeNameFormatter },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, download: true, editor: "number", editable: editCheck, 
			editorParams: {
				min: 0,
				max: 9999,
				step: 1,
				elementAttributes: { maxlength: "7" }
			},
			validator: ["required", "min:0.01", "max:9999"],
			formatter: cpmFormatter,
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
			formatter: priorityFormatter
		},
		{ field: 'status', title: 'Status', visible: true, download: true, editor: "select", editable: editCheck, editorParams: {
				elementAttributes: { class: "capitalize" },
				values:	[{ label: "Running", value: "running" }, { label: "Paused", value: "paused" }, {label: "Archived", value: "archived"}]
			},
			formatter: statusFormatter,
			width: 90,
			minWidth: 90
		},
		{ field: 'network', title: 'Network', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'overrideFields', title: 'Override Fields', download: true, formatter: jsonArrayFormatter, visible: false, sorter: 'string' },
		{ field: 'start', title: 'Start', visible: false, download: true, sorter: 'string' },
		{ field: 'end', title: 'End', visible: false, download: true, sorter: 'string' },
		{ field: 'active', title: 'Active', visible: false, download: true, sorter: 'string' },
		{ field: 'disabled', title: 'Disabled', visible: false, download: true, sorter: 'string' },
		{ field: 'keywords', title: 'Keywords', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'includeGeoTargeting', title: 'Geo Targeting Mode', visible: false, download: true },
		{ field: 'targetedCountries', title: 'Countries', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedRegions', title: 'Regions', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedCities', title: 'Cities', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'targetedZipCodes', title: 'ZipCodes', visible: false, download: true, formatter: jsonArrayFormatter, sorter: 'string' },
		{ field: 'autoCpm', title: 'AutoCpm', visible: false, download: true, sorter: 'string' },
		{ field: 'key', title: 'Key', visible: false, download: true, sorter: 'string' },
		{ field: 'budget', title: 'Budget', visible: false, download: true, sorter: 'string' },
		{ field: 'budgetType', title: 'Budget Type', visible: false, download: true, sorter: 'string' },
		{ field: 'frequencyCaps', title: 'Frequency Caps', visible: false, download: true, sorter: 'string' },
		{ field: 'bidStrategy', title: 'Bid Strategy', visible: false, download: true, sorter: 'string' },
	];

	let lineitemColumns = [
		{ rowHandle:true, formatter: "handle", headerSort: false, width: 30, minWidth: 30 },
		{ formatter: "rowSelection", titleFormatter: "", headerSort: false, resizable: false, cellClick: function(e, cell) {
				cell.getRow().toggleSelect();
			},
			width: 5
		},
		{ field: 'name', title: 'Name', visible: true, minWidth: 100, formatter: lineItemNameFormatter },
		{ field: 'type', title: 'Type', visible: true, minWidth: 110, width: 110, formatter: lineItemTypeFormatter },
		{ field: 'priority', title: 'Priority', visible: true, width: 90, formatter: priorityFormatterNotEditable },
		{ field: 'bid', title: 'CPM', sorter: "number", visible: true, minWidth: 100, width: 100, formatter: cpmFormatterNotEditable },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: statusFormatterNotEditable },
		{ field: 'networkType', title: 'Network Type', visible: false },
		{ field: 'key', title: 'Key', visible: false },
		{ field: 'orderName', title: 'orderName', visible: false }
	];

  let orderColumns = [
		{ formatter: "rowSelection", titleFormatter: "", headerSort: false, resizable: false, cellClick: function(e, cell) {
				cell.getRow().toggleSelect();
			},
			width: 5
		},
		{ field: 'name', title: 'Order', visible: true, formatter: orderNameFormatter },
		{ field: 'lineItemCount', title: 'Total', visible: true, sorter: "number", minWidth: 90, width: 90 },
		{ field: 'activeLineItemCount', title: 'Active', sorter: "number", visible: true, minWidth: 90, width: 90 },
		{ field: 'status', title: 'Status', visible: true, minWidth: 90, width: 90, formatter: statusFormatterNotEditable },
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
	
	function createCellHtmlForObject(lineItemKey, object) {
		let html = "";
		for (let key in object) {
			html += '<div>';
			if (key == "html_data") {
				html += `<span class="cell-header">${key}</span>: <a class="customHtml" key="${lineItemKey}">click</a>`;
				customHtmlStore.save(lineItemKey, object[key]);
			} else {
				html += `<span class="cell-header">${key}</span>: ${object[key]}`;
			}
			html += '</div>';
		}
		return html;
	}

	function createCellHtmlForArray(lineItemKey, array) {
		let html = '<div>';
		for (let i=0; i < array.length; i++) {
			let value = JSON.stringify(array[i], undefined, 2).replace(/"/g,"");
			html += `<div class="ui tiny label less-padding-label">${value}</div>`;
		}
		html += '</div>';
		return html;
	}

	function jsonArrayFormatter(cell, formatterParams, onRendered) {
		let lineItemKey = cell.getData().key;
		let value = cell.getValue();
		let html = "";
		if (jQuery.type(value) == "object") {
			html += createCellHtmlForObject(lineItemKey, value);
		} else if (jQuery.type(value) == "array") {
			html += createCellHtmlForArray(lineItemKey, value);
		} else if (_.isEmpty(value)) {
			// html += "";
		} else {
			html += value;
		}
		return html;
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

	// Formatters
	
	function nameFormatter(cell, formatterParams, onRendered) {
		let marketplace_regex = /^marketplace$/i;
		if (!marketplace_regex.test(cell.getValue())) {
			let cellElement = cell.getElement();
			$(cellElement).addClass("editable-cell");
		}
		return cell.getValue();
	}
	
	function typeNameFormatter(cell, formatterParams, onRendered) {
		return (TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : TYPE_NAME[cell.getValue()];
	}

	function networkTypeNameFormatter(cell, formatterParams, onRendered) {
		return (NETWORK_TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : NETWORK_TYPE_NAME[cell.getValue()];
	}

	function lineItemNameFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let html = `<div class="lineitem-name">${cell.getValue()}</div><div class="lineitem-ordername">${rowData.orderName}</div>`; 
		return html;
	}

	function lineItemTypeFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let typeName = (TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : TYPE_NAME[cell.getValue()];
		let networkTypeName = (_.isEmpty(rowData.networkType)) ? "" : NETWORK_TYPE_NAME[rowData.networkType];
		let html;
		if (networkTypeName == undefined) {
			html = `<div class="lineitem-name">${typeName}</div><div class="lineitem-networktype">${rowData.networkType}</div>`;
		} else if (networkTypeName == "") {
			// Non networks
			html = `<div class="lineitem-name">${typeName}</div>`;
		} else {
			html = `<div class="lineitem-name">${typeName}</div><div class="lineitem-networktype">${networkTypeName}</div>`;
		}
		return html;
	}

	function orderNameFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let html = `<div class="lineitem-name">${cell.getValue()}</div><div class="lineitem-ordername">${rowData.key}</div>`; 
		return html;
	}

	function cpmFormatter(cell, formatterParams, onRendered) {
		let cellElement = cell.getElement();
		$(cellElement).addClass("editable-cell");
		let html = `$ <span class="ui basic label cpm-label">${cell.getValue()}</span>`;
		return html;
	}

	function priorityFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let marketplace_regex = /^marketplace$/i;
		if (!marketplace_regex.test(rowData.name)) {
			let cellElement = cell.getElement();
			$(cellElement).addClass("editable-cell");
		}
		let html = `<span class="ui gray circular label small">${cell.getValue()}</span>`;
		return html;
	}
	
	function statusFormatter(cell, formatterParams, onRendered) {
		let cellElement = cell.getElement();
		let cellValue = cell.getValue();
		$(cellElement).addClass("editable-cell");
		let color = "gray";
		switch (cellValue) {
			case "running":
				color = "green";
				break;
			case "paused":
				color = "yellow";
				break;
			default:
				break;
		}
		let html = `<a class="ui ${color} empty circular label mini"></a> ${cellValue.capitalize()}`;
		return html;
	}

	// Not Editable Formatters
	
	function statusFormatterNotEditable(cell, formatterParams, onRendered) {
		let cellValue = cell.getValue();
		let color = "gray";
		switch (cellValue) {
			case "running":
				color = "green";
				break;
			case "paused":
				color = "yellow";
				break;
			default:
				break;
		}
		let html = `<a class="ui ${color} empty circular label mini"></a> ${cellValue.capitalize()}`;
		return html;
	}

	function cpmFormatterNotEditable(cell, formatterParams, onRendered) {
		let html = `$ <span class="ui basic label cpm-label">${cell.getValue()}</span>`;
		return html;
	}

	function priorityFormatterNotEditable(cell, formatterParams, onRendered) {
		let html = `<span class="ui gray circular label small">${cell.getValue()}</span>`;
		return html;
	}

  return {
		getColumnDef: getColumnDef
  }

})(this);










