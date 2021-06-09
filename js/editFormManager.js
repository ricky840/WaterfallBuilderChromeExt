var editFormManager = (function(global) {
  "use strict";

	let keywordTagify;

	const DOM_ID = {
		cpmId: "edit-cpm",
		priorityId: "edit-priority-select",
		statusId: "edit-status-select",
		autocpmId: "edit-disallow-autocpm-select",
		idfaTargetgId: "edit-idfa-targeting-select",
		targetModeId: "target-mode",
		targetCountryId: "target-country",
		tagifyKeywords: "tagify-keywords",
		assignAdUnitKey: "edit-adunit-dropdown",
		removeAllKeywords: "chkbox-remove-keywords"
	};

	function initForm(notification) {
		$(`#${DOM_ID.priorityId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.statusId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.autocpmId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.idfaTargetgId}`).dropdown({ clearable: true });	
		$(`#${DOM_ID.targetCountryId} .menu`).html(createCountryMenuListHtml());
		$(`#${DOM_ID.targetCountryId}`).dropdown({
			onChange: function(value, text, element) {
				const field = $(`#${DOM_ID.targetCountryId}`).closest('.field');
				field.removeClass("error");
				// If nothing was selected, disable save preset button
				const savePresetButton = field.find(".country-save-preset");
				(_.isEmpty(value)) ? savePresetButton.addClass("disabled") : savePresetButton.removeClass("disabled");
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

		// Remove all keywords
		$(`#${DOM_ID.removeAllKeywords}`).checkbox({
			onChecked: function() {
				$(".keywords-field").addClass('disabled');	
			},
			onUnchecked: function() {
				$(".keywords-field").removeClass('disabled');	
			}
		});

		// Ad Unit list will be inited separately
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
		// disallowautocpm
		if ("disallowAutoCpm" in rowData && rowData.disallowAutoCpm == true) {
			$(`#${DOM_ID.autocpmId}`).dropdown('set selected', "true");
		} else if ("disallowAutoCpm" in rowData && rowData.disallowAutoCpm == false) {
			$(`#${DOM_ID.autocpmId}`).dropdown('set selected', "false");
		} else {
			$(`#${DOM_ID.autocpmId}`).dropdown('restore defaults');
		}
		//Idfa Targeting
		$(`#${DOM_ID.idfaTargetgId}`).dropdown('set selected', rowData.idfaTargeting);
		$(`#${DOM_ID.assignAdUnitKey}`).dropdown('set exactly', rowData.adUnitKeys);
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
			NOTIFICATIONS.overrideFieldInputError.message = error;
			toast.show(NOTIFICATIONS.overrideFieldInputError);
			console.log(error);
			return false;
		}
	}
		
	function parseInput(formData) {
		let userData = {};

		formData.forEach(data => {
			switch (data.name) {
				case "cpm":
					const cpm = parseFloat(data.value.trim());
					if (cpm > 0.01 && cpm < 9999) userData["bid"] = cpm;
					break;

				case "priority":
					const priority = parseInt(data.value);
					if (priority > 0 && priority < 17) userData["priority"] = priority;
					break;

				case "status":
					const status = data.value;
					if (!_.isEmpty(status)) userData["status"] = status;
					break;

				case "target_mode":
					const targetMode = data.value;
					if (!_.isEmpty(targetMode)) userData["targetMode"] = targetMode;
					break;

				case "target_country":
					const targetCountries = data.value;
					if (_.isEmpty(targetCountries)) {
						userData["targetCountries"] = []; // Should be able to send empty array
					} else {
						userData["targetCountries"] = targetCountries.split(",").sort(); // Should be able to send empty array
					}
					break;

				case "idfa_targeting":
					const idfaTargeting = data.value.trim();
					if (!_.isEmpty(idfaTargeting)) userData["idfaTargeting"] = idfaTargeting;
					break;

				case "disallow_autocpm":
					let disallowAutoCpm = data.value.trim();
					if (disallowAutoCpm == "true") {
						disallowAutoCpm = true;
					} else if (disallowAutoCpm == "false") {
						disallowAutoCpm = false;
					} else {
						disallowAutoCpm = undefined;
					}
					if (disallowAutoCpm != undefined) userData["disallowAutoCpm"] = disallowAutoCpm;
					break;

				case "keywords":
					// If empty, then don't update keyword. If remove-keywords is checked, then remove all keywords
					const removeKeywords = $(`#${DOM_ID.removeAllKeywords}`).checkbox("is checked");
					if (removeKeywords) {
						userData["keywords"] = [];
					} else {
						try {
							const keywords = JSON.parse(data.value);
							let keywordList = [];
							keywords.forEach(keyword => {
								keywordList.push(keyword.value);
							});
							userData["keywords"] = keywordList;
						} catch (e) {
							console.log("Keyword not selected");
						}
					}
					break;

				case "assign_adunit_key":
					// If there was no input, then don't update.
					const adUnitKeys = data.value.split(",");
					if (!_.isEmpty(data.value)) {
						userData["adUnitKeys"] = adUnitKeys;
					}
					break;

				default:
					break;
			}	
		});
	
		return userData;
	}

	function resetForm() {
		$(`#${DOM_ID.cpmId}`).val('');	
		$(`#${DOM_ID.priorityId}`).dropdown('clear');	
		$(`#${DOM_ID.statusId}`).dropdown('clear');	
		$(`#${DOM_ID.idfaTargetgId}`).dropdown('clear');
		$(`#${DOM_ID.autocpmId}`).dropdown('clear');
		$(`#${DOM_ID.targetModeId}`).dropdown('clear');
		$(`#${DOM_ID.targetCountryId}`).dropdown('clear');
		$(`#${DOM_ID.assignAdUnitKey}`).dropdown('clear');
		$(`#${DOM_ID.removeAllKeywords}`).checkbox('uncheck');
		keywordTagify.removeAllTags();
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
		let placement_id = (_.isEmpty(overrideFields.placement_id)) ? "" : escapeDoubleQuote(overrideFields.placement_id);
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
			case "fyber":
				html = `
					<div class="field required">
						<label>Spot Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
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
			case "inmobi_sdk":
					html = `
						<div class="field required">
							<label>Account Id</label>
							<input type="text" name="network_account_id" value="${network_account_id}">
						</div>
						<div class="field required">
							<label>Placement Id</label>
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
			case "pangle":
				html = `
					<div class="field required">
						<label>Ad Placement Id</label>
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
						<label>Unit Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>
					<div class="field required">
						<label>App Id</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>
					<div class="field required">
						<label>Placement Id</label>
						<input type="text" name="placement_id" value="${placement_id}">
					</div>`;
				break;
			case "ogury":
				html = `
					<div class="field required">
						<label>Asset Key</label>
						<input type="text" name="network_app_id" value="${network_app_id}">
					</div>
					<div class="field required">
						<label>Ad Unit Id</label>
						<input type="text" name="network_adunit_id" value="${network_adunit_id}">
					</div>`;
				break;
			case "snap":
				html = `
					<div class="field required">
						<label>Slot Id</label>
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
