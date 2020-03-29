var tableFormatters = (function(global) {
  "use strict";

	// line item name, add editable class if it is not marketplace
	function nameFormatter(cell, formatterParams, onRendered) {
		let marketplace_regex = /^marketplace$/i;
		let rowData = cell.getData();
		let html = `<div class="lineitem-name">${cell.getValue()}</div><div class="lineitem-ordername">${rowData.orderName}</div>`; 
		if (!marketplace_regex.test(cell.getValue())) {
			$(cell.getElement()).addClass("editable-cell");
		}
		return html;
	}

	function lineItemKeyFormatter(cell, formatterParams, onRendered) {
		let html = `<a class="lineitem-key-link" href="https://app.mopub.com/line-item?key=${cell.getValue()}" target="_blank">${cell.getValue()}</a>`;
		return html;
	}

	// line item type name formatter
	function typeNameFormatter(cell, formatterParams, onRendered) {
		return (TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : TYPE_NAME[cell.getValue()];
	}

	// line item network type name formatter
	function networkTypeNameFormatter(cell, formatterParams, onRendered) {
		return (NETWORK_TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : NETWORK_TYPE_NAME[cell.getValue()];
	}

	function cpmFormatter(cell, formatterParams, onRendered) {
		$(cell.getElement()).addClass("editable-cell");
		let html = `$ <span class="ui basic label cpm-label">${cell.getValue()}</span>`;
		return html;
	}

	function priorityFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let marketplace_regex = /^marketplace$/i;
		if (!marketplace_regex.test(rowData.name)) {
			$(cell.getElement()).addClass("editable-cell");
		}
		let html = `<span class="ui gray circular label small">${cell.getValue()}</span>`;
		return html;
	}
	
	function statusFormatter(cell, formatterParams, onRendered) {
		let cellValue = cell.getValue();
		$(cell.getElement()).addClass("editable-cell");
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

	function checkBoxFormatter(cell, formatterParams, onRendered) {
		let html =`<div class='ui checkbox fitted'><input type='checkbox'><label></label></div>`;
		let cellElement = cell.getElement();
		onRendered(function() {
			let input = $(cellElement).find("input");
			cell.getRow().isSelected() ? input.prop('checked', true) : input.prop('checked', false);
		});
		return html;
	}

	function geoTargetModeFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let marketplace_regex = /^marketplace$/i;
		if (!marketplace_regex.test(rowData.name)) {
			$(cell.getElement()).addClass("editable-cell");
		}
		return cell.getValue().capitalize();
	}

	function jsonArrayFormatter(cell, formatterParams, onRendered) {
		let lineItemKey = cell.getData().key;
		let value = cell.getValue();
		let html = "";
		if (cell.getField() == "overrideFields" || cell.getField() == "targetedCountries") {
			if (!_.isEmpty(clearEmpties(value)))	$(cell.getElement()).addClass("editable-cell");
		}

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

	// LineItemTable only
	
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

	// OrderTable only
	
	function orderNameFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let html = `<div class="lineitem-name">${cell.getValue()} (${rowData.activeLineItemCount} / ${rowData.lineItemCount})</div>`;
		html += `<div class="lineitem-ordername">${rowData.key}</div>`; 
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
 
	// Formatter Helpers
	
	function createCellHtmlForObject(lineItemKey, object) {
		let html = "";
		for (let key in object) {
			if (_.isEmpty(object[key])) continue;
			html += '<div>';
			if (key == "html_data") {
				// html += `<span class="cell-header">${key}</span>: <a class="customHtml" key="${lineItemKey}">click</a>`;
				html += `<span class="cell-header">${key}</span><span class="cell-format-value"><a href="https://app.mopub.com/edit-line-item?key=${lineItemKey}" target="_blank">click</a></span>`;
			} else {
				html += `<span class="cell-header">${key}</span><span class="cell-format-value">${object[key]}</span>`;
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

  return {
		nameFormatter: nameFormatter,
		typeNameFormatter: typeNameFormatter,
		lineItemKeyFormatter: lineItemKeyFormatter,
		networkTypeNameFormatter: networkTypeNameFormatter,
		cpmFormatter: cpmFormatter,
		priorityFormatter: priorityFormatter,
		statusFormatter: statusFormatter,
		checkBoxFormatter: checkBoxFormatter,
		geoTargetModeFormatter: geoTargetModeFormatter,
		jsonArrayFormatter: jsonArrayFormatter,
		lineItemNameFormatter: lineItemNameFormatter,
		lineItemTypeFormatter: lineItemTypeFormatter,
		orderNameFormatter: orderNameFormatter,
		statusFormatterNotEditable: statusFormatterNotEditable,
		cpmFormatterNotEditable: cpmFormatterNotEditable,
		priorityFormatterNotEditable: priorityFormatterNotEditable
  }
})(this);
