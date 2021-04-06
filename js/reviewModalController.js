var reviewModalController = (function(global) {
  "use strict";

	function formatter(updatedFields) {
		let json = JSON.stringify(updatedFields, null, 2);
		return _.escape(json);
	}

	function createHtml(lineItems) {
		let html;

		lineItems.forEach((lineItem) => {
			const lineItemType = (_.isEmpty(TYPE_NAME[lineItem.getType()])) ? lineItem.getType() : TYPE_NAME[lineItem.getType()];
			let networkType;
			if (_.isEmpty(NETWORK_TYPE_NAME[lineItem.getNetworkType()])) {
				if (_.isEmpty(lineItem.getNetworkType())) {
					// For non-network (ex: mpx)
					networkType = "Non Network"
				} else {
					// Unknown network
					networkType = lineItem.getNetworkType();
				}
			} else {
				networkType = NETWORK_TYPE_NAME[lineItem.getNetworkType()];
			}

			html += `
				<tr>
					<td>
						<div>${lineItem.getName()}</div>
						<div>${lineItem.getKey()}</div>
					</td>
					<td style="font-weight: bold;">
						${(lineItem.isNewlyCreated()) ? "Create" : "Update"}
					</td>
					<td>
						<div>${lineItemType}</div>
						<div class="lineitem-networktype">${networkType}</div>
					</td>
					<td>
						<pre class="change-pre">${formatter(lineItem.getChanges())}</pre>
					</td>
				</tr>`;	
		});

		return html;
	}

  return {
		createHtml: createHtml
  }
})(this);
