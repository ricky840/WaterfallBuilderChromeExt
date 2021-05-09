/* overrideFieldValidator validates required field and removes unnecessary fields. It returns related fields only. */

var overrideFieldValidator = (function(global) {
  "use strict";

	function validate(networkType, value) {

		// Set default
		let overrideFields = {
			network_account_id: "",
			network_adunit_id: "",
			network_app_id: ""
		};

		// Network Name Mapping
		let networkName = (NETWORK_TYPE_NAME[networkType] == undefined) ? networkType : NETWORK_TYPE_NAME[networkType];

		switch(networkType) {
			case "admob_native":
				if (_.isEmpty(value.network_adunit_id)) {
					throw new Error(`${networkName} requires network_adunit_id`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					delete overrideFields.network_account_id;
					delete overrideFields.network_app_id;
				}
				break;
			case "applovin_sdk":
				if (_.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_app_id (app id)`);
				} else {
					overrideFields.network_adunit_id = (_.isEmpty(value.network_adunit_id)) ? '' : value.network_adunit_id; // zone id optional
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "adcolony":
				if (_.isEmpty(value.network_app_id) || _.isEmpty(value.network_adunit_id)) {
					throw new Error(`${networkName} requires network_app_id and network_adunit_id (zone id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // zone id required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "chartboost":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.app_signature)) {
					throw new Error(`${networkName} requires network_app_id and app_signature`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // MoPub UI shows app id but it is actually ad unit id. Required.
					overrideFields.app_signature = value.app_signature; // required
					overrideFields.location = (_.isEmpty(value.location)) ? '' : value.location; // optional
					delete overrideFields.network_account_id;
					delete overrideFields.network_app_id;
				}
				break;
			case "facebook":
				if (_.isEmpty(value.network_adunit_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					delete overrideFields.network_app_id;
					delete overrideFields.network_account_id;
				}
				break;
			case "ironsource":
				if (_.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_app_id (app key)`);
				} else {
					overrideFields.network_app_id = value.network_app_id; // required
					overrideFields.network_adunit_id = (_.isEmpty(value.network_adunit_id)) ? '' : value.network_adunit_id; // optional
					delete overrideFields.network_account_id;
				}
				break;
			case "tapjoy":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id) and network_app_id (sdk key)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "vungle":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id) and network_app_id (app id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "pangle":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id), network_app_id (game id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "snap":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (slot id), network_app_id (app id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "unity":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id), network_app_id (game id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "verizon":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (placement id), network_app_id (site id)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "yahoo":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires network_adunit_id (adunit), network_app_id (api key)`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "custom_native":
				if (_.isEmpty(value.custom_event_class_name) || _.isEmpty(value.custom_event_class_data)) {
					throw new Error(`${networkName} requires custom_event_class_name, custom_event_class_data`);
				} else {
					overrideFields.custom_event_class_name = value.custom_event_class_name; // required
					overrideFields.custom_event_class_data = value.custom_event_class_data; // required
					delete overrideFields.network_account_id;
					delete overrideFields.network_app_id;
					delete overrideFields.network_adunit_id;
				}
				break;
			case "custom_html":
				overrideFields.html_data = value.html_data; // required
				delete overrideFields.network_account_id;
				delete overrideFields.network_app_id;
				delete overrideFields.network_adunit_id;
				break;
			default:
				overrideFields.network_account_id = value.network_account_id;
				overrideFields.network_app_id = value.network_app_id;
				overrideFields.network_adunit_id = value.network_adunit_id;
				break;
		}

		return clearEmpties(overrideFields);
	}

  return {
		validate: validate
  }
})(this);
