var tableFormatters = (function(global) {
  "use strict";

	/** 
	 * General formatters 
	 */

	function stringFormatter(cell, formatterParams, onRendered) {
		const value = cell.getValue();
		return `<span class="ui text cell-string-val">${value}</span>`;
	}

	function stringArrayFormatter(cell, formatterParams, onRendered) {
		const strList = cell.getValue();
		if (!_.isEmpty(strList)) {
			let html = "";
			strList.forEach(each => { html += `<div>${each}</div>`;	});
			return html;
		} else {
			return "";
		}
	}

	function booleanFormatter(cell, formatterParams, onRendered) {
		const value = cell.getValue();
		let html;
		if (value) {
			html = `<span class="ui green text cell-boolean-val">${value}</span>`;
		} else {
			html = `<span class="ui grey text cell-boolean-val">false</span>`;
		}
		return html;
	}

	function percentageFormatter(cell, formatterParams, onRendered) {
		const value = cell.getValue();
		return `${value}%`;
	}

	function secondFormatter(cell, formatterParams, onRendered) {
		const value = cell.getValue();
		return `${value}s`;
	}

	function objectFormatter(cell, formatterParams, onRendered) {
		const value = cell.getValue();
		let	html = "";
		for (let key in value) {
			const betterKeyName = key.replace(/network_/g, "").replace(/_/g, " ");
			html += `
			<div>
				<span class="cell-header">${betterKeyName}</span>
				<span class="cell-format-value">${value[key]}</span>
			</div>`;
		}
		return html;
	}

	/** 
	 * Field specific formatters 
	 */

	// Line item name, add editable class if it is not marketplace (marketplace tab)
	function nameFormatter(cell, formatterParams, onRendered) {
		const rowData = cell.getData();
		const html = ` 
			<div class="lineitem-name">${cell.getValue()}</div>
			<div class="lineitem-ordername">${rowData.orderName}</div>`; 
		makeEditableCell(cell);
		return html;
	}

	// Line item key formatter
	function lineItemKeyFormatter(cell, formatterParams, onRendered) {
		const html = `
			<a class="lineitem-key" href="${LINE_ITEM_PAGE_URL + cell.getValue()}" target="_blank">
				${cell.getValue()}
			</a>`;
		return html;
	}

	// Line item type formatter
	function lineItemTypeFormatter(cell, formatterParams, onRendered) {
		const rowData = cell.getData();
		const typeName = (TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : TYPE_NAME[cell.getValue()];
		const networkTypeName = (_.isEmpty(rowData.networkType)) ? "" : NETWORK_TYPE_NAME[rowData.networkType];
		let html;
		if (networkTypeName == undefined) {
			html = `
				<div class="lineitem-name">${typeName}</div>
				<div class="lineitem-networktype">${rowData.networkType}</div>`;
		} else if (networkTypeName == "") {
			// Non networks
			html = `<div class="lineitem-name">${typeName}</div>`;
		} else {
			html = `
				<div class="lineitem-name">${typeName}</div>
				<div class="lineitem-networktype">${networkTypeName}</div>`;
		}
		return html;
	}

	// Line item network type name formatter
	function networkTypeNameFormatter(cell, formatterParams, onRendered) {
		const networkType = (NETWORK_TYPE_NAME[cell.getValue()] == undefined) ? cell.getValue() : NETWORK_TYPE_NAME[cell.getValue()];
		const html = `<div class="lineitem-networktype">${networkType}</div>`;
		return html;
	}

	// CPM formatter
	function cpmFormatter(cell, formatterParams, onRendered) {
		makeEditableCell(cell);
		const html = `$ <span class="ui basic label cpm-label">${cell.getValue()}</span>`;
		return html;
	}

	// Priority formatter
	function priorityFormatter(cell, formatterParams, onRendered) {
		const rowData = cell.getData();
		makeEditableCell(cell);
		const html = `<span class="ui grey basic label small">${cell.getValue()}</span>`;
		return html;
	}

	// Status formatter
	function statusFormatter(cell, formatterParams, onRendered) {
		const cellValue = cell.getValue();
		makeEditableCell(cell);
		let color;
		switch (cellValue) {
			case "running":
				color = "green";
				break;
			case "paused":
				color = "yellow";
				break;
			default:
				color = "gray";
				break;
		}
		const html = `<a class="ui ${color} empty circular label mini"></a> ${cellValue.capitalize()}`;
		return html;
	}

	// Geo target mode formatter
	function geoTargetModeFormatter(cell, formatterParams, onRendered) {
		const rowData = cell.getData();
		makeEditableCell(cell);
		return cell.getValue().capitalize();
	}

	// Ad Unit Keys formatter
	function adUnitKeysFormatter(cell, formatterParams, onRendered) {
		makeEditableCell(cell);
		const adUnitKeys = cell.getValue();
		if (_.isEmpty(adUnitKeys)) return false;

		let html = "";
		adUnitKeys.forEach(key => {
			let name = adUnitManager.getAdUnitNameByKey(key);
			html += `<div>${name}</div>`;
		});
		return html;
	}

	// Disallow autocpm formatter
	function disallowAutoCpmFormatter(cell, formatterParams, onRendered) {
		makeEditableCell(cell);
		return booleanFormatter(cell);
		// return (cell.getValue()) ? "True" : "False";
	}

	// Override field formatter
	function overrideFieldFormatter(cell, formatterParams, onRendered) {
		const lineItemKey = cell.getData().key;
		const lineItemType = cell.getData().type;
		const value = cell.getValue();

		// Only network has the override field
		if (lineItemType != "network") return;

		makeEditableCell(cell);

		let	html = "";
		for (let key in value) {
			if (_.isEmpty(value[key])) continue;
			const betterKeyName = key.replace(/network_/g, "").replace(/_/g, " ");
			if (key == "html_data") {
				html += `
				<div>
					<span class="cell-header">${betterKeyName}</span>
					<span class="cell-format-value">
						<a href="${LINE_ITEM_EDIT_PAGE_URL + lineItemKey}" target="_blank">Click</a>
					</span>
				</div>`;
			} else {
				html += `
				<div>
					<span class="cell-header">${betterKeyName}</span>
					<span class="cell-format-value">${value[key]}</span>
				</div>`;
			}
		}

		return html;
	}

	// String list in label format
	function labelListFormatter(cell, formatterParams, onRendered) {
		const list = cell.getValue();
		const fieldName = cell.getField();
		if (_.isEmpty(list)) return;

		// Only targetedCountries, keyword is editable for now!
		if (fieldName == "targetedCountries" || fieldName == "keywords") makeEditableCell(cell);

		let html = '<div>';
		list.forEach(each => {
			const value = JSON.stringify(each, undefined, 2).replace(/"/g,"");
			html += `<div class="ui tiny label basic cell-inside-label">${value}</div>`;
		});
		html += '</div>';

		return html;
	}

	/**
	 * For order table only  
	 */

	function orderNameFormatter(cell, formatterParams, onRendered) {
		let rowData = cell.getData();
		let html = `<div class="lineitem-name">${cell.getValue()}</div>`;
		html += `<a class="lineitem-key-link" href="https://app.mopub.com/order?key=${rowData.key}" target="_blank">${rowData.key}</a>`;
		return html;
	}

	/**
	 * For AB table only  
	 */

	function abNameFormatter(cell, formatterParams, onRendered) {
		return `${NETWORK_TYPE_NAME[cell.getValue()]}`;
	}

	/**
	 * Helpers 
	 */

	function makeEditableCell(cell) {
		const rowData = cell.getData();
		// Make exception for marketplace tab, not mpx_line_item
		const marketplace_regex = /^marketplace$/i;
		if (!marketplace_regex.test(rowData.name)) {
			cell.getElement().classList.add("editable-cell");
		}
	}

  return {
		nameFormatter: nameFormatter,
		lineItemKeyFormatter: lineItemKeyFormatter,
		lineItemTypeFormatter: lineItemTypeFormatter,
		networkTypeNameFormatter: networkTypeNameFormatter,
		cpmFormatter: cpmFormatter,
		priorityFormatter: priorityFormatter,
		statusFormatter: statusFormatter,
		geoTargetModeFormatter: geoTargetModeFormatter,
		adUnitKeysFormatter: adUnitKeysFormatter,
		disallowAutoCpmFormatter: disallowAutoCpmFormatter,
		overrideFieldFormatter: overrideFieldFormatter,
		orderNameFormatter: orderNameFormatter,
		labelListFormatter: labelListFormatter,
		booleanFormatter: booleanFormatter,
		stringFormatter: stringFormatter,
		percentageFormatter: percentageFormatter,
		secondFormatter: secondFormatter,
		stringArrayFormatter: stringArrayFormatter,
		objectFormatter: objectFormatter,
		abNameFormatter: abNameFormatter
  }
})(this);
