var newLineItemFactory = (function(global) {
  "use strict";
	
	const templateNetwork = {
		adUnitKeys: [],
		bid: 1,
		name: NEW_NETWORK_LINEITEM_NAME,
		priority: 12,
		startImmediately: true,
		type: "network",
		status: "running",
		includeGeoTargeting: "all",
		enableOverrides: true
	};

	const templateDirect = {
		adUnitKeys: [],
		bid: 1,
		name: NEW_DIRECT_LINEITEM_NAME,
		priority: 12,
		type: "gtee",
		status: "running",
		includeGeoTargeting: "all"
	};

	const templateMPX = {
		adUnitKeys: [],
		bid: 1,
		name: NEW_MPX_LINEITEM_NAME,
		priority: 12,
		type: "mpx_line_item",
		status: "running",
		includeGeoTargeting: "all"
	};

	const overrideFieldsTemplate = {
		network_account_id: "Network account id",
		network_app_id: "Network app id",
		network_adunit_id: "Network ad unit id",
		placement_id: "Placement id",
		app_signature: "App signature",
		location: "Location",
		custom_event_class_name: "Custom event class name",
		custom_event_class_data: "Custom event class data"
	};

	function add(type, order, adUnitKey) {
		let	newLineItem;

		switch(type) {
			case "add-mpx":
				newLineItem = JSON.parse(JSON.stringify(templateMPX));
				break;
			case "add-admob":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "admob_native";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-adcolony":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "adcolony";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-applovin":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "applovin_sdk";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-chartboost":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "chartboost";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-facebook":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "facebook";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-ironsource":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "ironsource";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-inmobi":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "inmobi_sdk";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break
			case "add-tapjoy":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "tapjoy";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-vungle":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "vungle";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-pangle":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "pangle";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-snap":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "snap";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-unity":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "unity";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-verizon":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "verizon";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-yahoo":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "yahoo";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "add-customsdk":
				newLineItem = JSON.parse(JSON.stringify(templateNetwork));
				newLineItem.networkType = "custom_native";
				newLineItem.overrideFields = overrideFieldValidator.validate(newLineItem.networkType, overrideFieldsTemplate);
				break;
			case "gtee":
				newLineItem = JSON.parse(JSON.stringify(templateDirect))
				newLineItem.type = "gtee";
				break;
			case "non_gtee":
				newLineItem = JSON.parse(JSON.stringify(templateDirect))
				newLineItem.type = "non_gtee";
				break;
			case "promo":
				newLineItem = JSON.parse(JSON.stringify(templateDirect))
				newLineItem.type = "promo";
				break;
			case "backfill_promo":
				newLineItem = JSON.parse(JSON.stringify(templateDirect))
				newLineItem.type = "backfill_promo";
				break;
			default:
				break;
		}

		// Add order Info (Name will be removed in the api call)
		newLineItem.orderKey = order.key;
		newLineItem.orderName = order.name;

		// Add Ad Unit key
		newLineItem.adUnitKeys.push(adUnitKey);

		// Assign Temp Key
		newLineItem.key = `temp-${stringGen(32)}`;

		// Add to the Waterfall
		WaterfallTable.addData([newLineItem], true);
	}	

  return {
		add: add
  }
})(this);