var reviewChange = (function(global) {
  "use strict";

	function formatter(updatedFields) {
		let json = JSON.stringify(updatedFields, null, 2);
		return _.escape(json);
	}

	function createHtml(changes) {
		let html;
		for (let lineItemKey in changes) {
			let change = changes[lineItemKey];

			let type;
			if (_.isEmpty(change.type)) {
				type = "";
			} else {
			  type = (TYPE_NAME[change.type] == undefined) ? change.type : TYPE_NAME[change.type];
			}

			let network;
			if (_.isEmpty(change.networkType)) {
				network = "";
			} else {
			  network = (NETWORK_TYPE_NAME[change.networkType] == undefined) ? change.networkType : NETWORK_TYPE_NAME[change.networkType];
			}

			html += `
			<tr>
				<td>${change.lineItemName}</td>
				<td><pre>${lineItemKey}</pre></td>
				<td style="font-weight: bold;">${change.action.capitalize()}</td>
				<td><div>${type}</div><div class="lineitem-networktype">${network}</div></td>
				<td><pre class="change-pre">${formatter(change.updatedFields)}</pre></td>
			</tr>`;
		}
		return html;
	}

  return {
		createHtml: createHtml
  }
})(this);
