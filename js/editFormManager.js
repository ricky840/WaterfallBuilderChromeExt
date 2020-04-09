var editFormManager = (function(global) {
  "use strict";

	let keywordTagify;

	const DOM_ID = {
		cpmId: "edit-cpm",
		priorityId: "edit-priority-select",
		statusId: "edit-status-select",
		targetModeId: "target-mode",
		targetCountryId: "target-country",
		tagifyKeywords: "tagify-keywords"
	};

	function initForm(notification) {
		$(`#${DOM_ID.priorityId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.statusId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.targetCountryId} .menu`).html(createCountryMenuListHtml());
		$(`#${DOM_ID.targetCountryId}`).dropdown({
			onChange: function(value, text, element) {
				$(`#${DOM_ID.targetCountryId}`).closest('.field').removeClass('error');
			}
		});
		$(`#${DOM_ID.targetModeId}`).dropdown({
			clearable: true,
			onChange: function(value, text, element) {
				if (value == "all" || value == "") {
					$(`#${DOM_ID.targetCountryId}`).closest('.field').addClass('disabled').removeClass('required');
					$(`#${DOM_ID.targetCountryId}`).dropdown('clear');
				} else {
					$(`#${DOM_ID.targetCountryId}`).closest('.field').removeClass('disabled').addClass('required');
				}
			}
		});
		let input = $(`#${DOM_ID.tagifyKeywords}`)[0];
		keywordTagify = new Tagify(input);
	}

	// load values for selected row (only when there is one row selected)
	function fillRowInfo(rowData) {
		$(`#${DOM_ID.cpmId}`).val(rowData.bid);	
		$(`#${DOM_ID.priorityId}`).dropdown('set selected', rowData.priority);	
		$(`#${DOM_ID.statusId}`).dropdown('set selected', rowData.status);
		$(`#${DOM_ID.targetModeId}`).dropdown('set selected', rowData.includeGeoTargeting);
		$(`#${DOM_ID.targetCountryId}`).dropdown('set exactly', rowData.targetedCountries);
		keywordTagify.removeAllTags();
		keywordTagify.addTags(rowData.keywords);
	}

	function updateNetworkInput(rowData) {
		let formData = $('#edit-override-form').serializeArray();
		let parsedInput = {};	
		for (let i=0; i < formData.length; i++) {
			parsedInput[formData[i].name] = formData[i].value.trim();
		}
		try {
			let overrideFields = overrideFieldValidator.validate(rowData.networkType, parsedInput);
			console.log(`Updated network info ${overrideFields}`);
			rowData.overrideFields = overrideFields;
			WaterfallTable.updateData([rowData]);
			return true;
		} catch(error) {
			notifier.editNetworkFormShow({message: error, type: "negative"});
			console.log(error);
			return false;
		}
	}
		
	function parseInput(formData) {
		let cpm, priority, status, targetMode, targetCountries, keywords; 
		// Parse data
		for (let i=0; i < formData.length; i++) {
			switch (formData[i].name) {
				case "cpm":
					cpm = parseFloat(formData[i].value.trim());
					break;
				case "priority":
					priority = formData[i].value.trim();
					break;
				case "status":
					status = formData[i].value.trim();
					break;
				case "target_mode":
					targetMode = formData[i].value.trim();
					break;
				case "target_country":
					targetCountries = formData[i].value.trim();
					break;
				case "keywords":
					try {
						let parsed = JSON.parse(formData[i].value);
						let values = [];
						for (let i=0; i < parsed.length; i++) {
							values.push(parsed[i].value);	
						}
						keywords = values.join(",");
						console.log(keywords);
					} catch (e) {
						console.log("Keyword not selected");
					}
					break;
				default:
					break;
			}
		}
		return {
			"cpm": cpm,
			"priority": priority,
			"status": status,
			"targetMode": targetMode,
			"targetCountries": targetCountries,
			"keywords": keywords
		}
	}

	function resetForm() {
		$(`#${DOM_ID.cpmId}`).val('');	
		$(`#${DOM_ID.priorityId}`).dropdown('clear');	
		$(`#${DOM_ID.statusId}`).dropdown('clear');	
		$(`#${DOM_ID.targetModeId}`).dropdown('clear');
		$(`#${DOM_ID.targetCountryId}`).dropdown('clear');
		keywordTagify.removeAllTags();
		notifier.clearEditForm();
	}

	function createCountryMenuListHtml() {
		let html = "";
		for (let i=0; i < COUNTRY_LIST.length; i++) {
			html +=	`<div class="item" data-value="${COUNTRY_LIST[i].country_code}">${COUNTRY_LIST[i].country}</div>`;
		}
		return html;
	};

	function createNetworkFieldForm(network, overrideFields) {
		let html;

		// Load existing values
		let network_account_id = (_.isEmpty(overrideFields.network_account_id)) ? "" : escapeDoubleQuote(overrideFields.network_account_id); 
		let network_app_id = (_.isEmpty(overrideFields.network_app_id)) ? "" : escapeDoubleQuote(overrideFields.network_app_id);
		let network_adunit_id = (_.isEmpty(overrideFields.network_adunit_id)) ? "" : escapeDoubleQuote(overrideFields.network_adunit_id);
		let app_signature = (_.isEmpty(overrideFields.app_signature)) ? "" : escapeDoubleQuote(overrideFields.app_signature);
		let location = (_.isEmpty(overrideFields.location)) ? "" : escapeDoubleQuote(overrideFields.location);
		let custom_event_class_name = (_.isEmpty(overrideFields.custom_event_class_name)) ? "" : escapeDoubleQuote(overrideFields.custom_event_class_name);
		let custom_event_class_data = (_.isEmpty(overrideFields.custom_event_class_data)) ? "" : escapeDoubleQuote(overrideFields.custom_event_class_data);

		switch (network) {
			case "admob_native":
				html = `
					<div class="field required">
						<label>Ad Unit Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>`;
				break;
			case "applovin_sdk":
				html = `
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>
					<div class="field">
						<label>Zone Id (Optional)</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>`;
				break;
			case "adcolony":
				html = `
					<div class="field required">
						<label>Zone Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "chartboost":
				html = `
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Signature</label>
						<input type="text" name="app_signature" value="${app_signature}">
					</div>
					<div class="field">
						<label>Location (Optional)</label>
						<input type="text" name="location" value="${location}">
					</div>`;
				break;
			case "facebook":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>`;
				break;
			case "ironsource":
				html = `
					<div class="field required">
						<label>App Key</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>
					<div class="field">
						<label>Instance Id (Optional)</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>`;
				break;
			case "tapjoy":
				html = `
					<div class="field required">
						<label>Placement Name</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>SDK Key</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "vungle":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "mintegral":
				html = `
					<div class="field required">
						<label>App Key</label>
						<input type="text" name="network_account_id" value="${network_account_id}">
					</div>
					<div class="field required">
						<label>Ad Unit Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "unity":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>Game Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "verizon":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>Site Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "yahoo":
				html = `
					<div class="field required">
						<label>Ad Unit Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>API Key</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>`;
				break;
			case "custom_native":
				html = `
					<div class="field required">
						<label>Custom Event Class Name</label>
						<input type="text" name="custom_event_class_name" value="${custom_event_class_name}">
					</div>
					<div class="field required">
						<label>Custom Event Class Data</label>
						<input type="text" name="custom_event_class_data" value="${custom_event_class_data}">
					</div>`;
				break;
			default:
				html = "";
				break;
		}

		return html;
	}
 
  return {
		initForm: initForm,
		resetForm: resetForm,
		parseInput: parseInput,
		fillRowInfo: fillRowInfo,
		createNetworkFieldForm: createNetworkFieldForm,
		updateNetworkInput: updateNetworkInput
  }
})(this);
