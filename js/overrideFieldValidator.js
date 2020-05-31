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
					throw new Error(`${networkName} requires <b>network_adunit_id</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					delete overrideFields.network_account_id;
					delete overrideFields.network_app_id;
				}
				break;
			case "applovin_sdk":
				if (_.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_app_id (app id)</b>`);
				} else {
					overrideFields.network_adunit_id = (_.isEmpty(value.network_adunit_id)) ? '' : value.network_adunit_id; // zone id optional
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "adcolony":
				if (_.isEmpty(value.network_app_id) || _.isEmpty(value.network_adunit_id)) {
					throw new Error(`${networkName} requires <b>network_app_id</b> and <b>network_adunit_id (zone id)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // zone id required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "chartboost":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.app_signature)) {
					throw new Error(`${networkName} requires <b>network_app_id</b> and <b>app_signature</b>`);
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
					throw new Error(`${networkName} requires <b>network_adunit_id (placement id)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					delete overrideFields.network_app_id;
					delete overrideFields.network_account_id;
				}
				break;
			case "ironsource":
				if (_.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_app_id (app key)</b>`);
				} else {
					overrideFields.network_app_id = value.network_app_id; // required
					overrideFields.network_adunit_id = (_.isEmpty(value.network_adunit_id)) ? '' : value.network_adunit_id; // optional
					delete overrideFields.network_account_id;
				}
				break;
			case "tapjoy":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (placement id)</b> and <b>network_app_id (sdk key)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "vungle":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (placement id)</b> and <b>network_app_id (app id)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "mintegral":
				if (_.isEmpty(value.network_account_id) || _.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id) || _.isEmpty(value.placement_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (unit id)</b>, <b>network_app_id (app id)</b>, <b>network_account_id (app key)</b>, <b>placement_id</b>`);
				} else {
					overrideFields.network_account_id = value.network_account_id; // required
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					overrideFields.placement_id = value.placement_id; // required
				}
				break;
			case "unity":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (placement id)</b>, <b>network_app_id (game id)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "verizon":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (placement id)</b>, <b>network_app_id (site id)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "yahoo":
				if (_.isEmpty(value.network_adunit_id) || _.isEmpty(value.network_app_id)) {
					throw new Error(`${networkName} requires <b>network_adunit_id (adunit)</b>, <b>network_app_id (api key)</b>`);
				} else {
					overrideFields.network_adunit_id = value.network_adunit_id; // required
					overrideFields.network_app_id = value.network_app_id; // required
					delete overrideFields.network_account_id;
				}
				break;
			case "custom_native":
				if (_.isEmpty(value.custom_event_class_name) || _.isEmpty(value.custom_event_class_data)) {
					throw new Error(`${networkName} requires <b>custom_event_class_name</b> and <b>custom_event_class_data</b>`);
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
