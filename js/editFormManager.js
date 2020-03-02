var editFormManager = (function(global) {
  "use strict";

	let keywordTagify;

	const DOM_ID = {
		cpmId: "edit-cpm",
		priorityId: "edit-priority-select",
		statusId: "edit-status-select",
		networkId: "edit-network-select",
		targetModeId: "target-mode",
		targetCountryId: "target-country",
		networkFieldsId: "network-fields",
		tagifyKeywords: "tagify-keywords"
	};

	function initForm(notification) {
		$(`#${DOM_ID.priorityId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.statusId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.networkId}`).dropdown({
			clearable: true,
			onChange: function(value, text, element) {
				if (value == "") {
					$(`#${DOM_ID.networkFieldsId}`).html("");
				} else {
					let html = createNetworkFieldForm(value);
					$(`#${DOM_ID.networkFieldsId}`).html(html);
				}
			}
		});	
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
		
	function parseInput(formData) {
		let cpm, priority, status, networkType, networkAdUnitId, networkAppId, appSignature, location, 
			customEventClassName, customEventClassData, targetMode, targetCountries, keywords; 
		// Parse data
		for (let i=0; i < formData.length; i++) {
			switch (formData[i].name) {
				case "cpm":
					cpm = formData[i].value.trim();
					break;
				case "priority":
					priority = formData[i].value.trim();
					break;
				case "status":
					status = formData[i].value.trim();
					break;
				case "network_type":
					networkType = formData[i].value.trim();
					break;
				case "network_app_id":
					networkAppId = formData[i].value.trim();
					break;
				case "network_adunit_id":
					networkAdUnitId = formData[i].value.trim();
					break;
				case "app_signature":
					appSignature = formData[i].value.trim();
					break;
				case "location":
					location = formData[i].value.trim();
					break;
				case "custom_event_class_name":
					customEventClassName = formData[i].value.trim();
					break;
				case "custom_event_class_data":
					customEventClassData = formData[i].value.trim();
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
			"networkType": networkType,
			"networkAdUnitId": networkAdUnitId,
			"networkAppId": networkAppId,
			"appSignature": appSignature,
			"location": location,
			"customEventClassName": customEventClassName,
			"customEventClassData": customEventClassData,
			"targetMode": targetMode,
			"targetCountries": targetCountries,
			"keywords": keywords
		}
	}

	function resetForm() {
		$(`#${DOM_ID.cpmId}`).val('');	
		$(`#${DOM_ID.priorityId}`).dropdown('clear');	
		$(`#${DOM_ID.statusId}`).dropdown('clear');	
		$(`#${DOM_ID.networkId}`).dropdown('clear');
		$(`#${DOM_ID.networkFieldsId}`).html('');
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

	function createNetworkFieldForm(network) {
		let html;

		switch (network) {
			case "admob_native":
				html = `
					<div class="field required">
						<label>Ad Unit Id</label>
						<input type="text" name="network_adunit_id">
					</div>`;
				break;
			case "applovin_sdk":
				html = `
					<div class="field">
						<label>Zone Id (Optional)</label>
						<input type="text" name="network_adunit_id">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id">
					</div>`;
				break;
			case "adcolony":
				html = `
					<div class="field required">
						<label>Zone Id</label>
						<input type="text" name="network_adunit_id">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id">
					</div>`;
				break;
			case "chartboost":
				html = `
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id">
					</div>
					<div class="field required">
						<label>App Signature</label>
						<input type="text" name="app_signature">
					</div>
					<div class="field">
						<label>Location (Optional)</label>
						<input type="text" name="location">
					</div>`;
				break;
			case "facebook":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id">
					</div>`;
				break;
			case "ironsource":
				html = `
					<div class="field required">
						<label>AdUnit Id</label>
						<input type="text" name="network_adunit_id">
					</div>
					<div class="field required">
						<label>App Key</label>
						<input type="text" name="network_app_id">
					</div>`;
				break;
			case "tapjoy":
				html = `
					<div class="field required">
						<label>Placement Name</label>
						<input type="text" name="network_adunit_id">
					</div>
					<div class="field required">
						<label>SDK Key</label>
						<input type="text" name="network_app_id">
					</div>`;
				break;
			case "vungle":
				html = `
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="network_adunit_id">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id">
					</div>`;
				break;
			case "custom_native":
				html = `
					<div class="field required">
						<label>Custom Event Class Name</label>
						<input type="text" name="custom_event_class_name">
					</div>
					<div class="field required">
						<label>Custom Event Class Data</label>
						<input type="text" name="custom_event_class_data">
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
		parseInput: parseInput
  }
})(this);