$(document).ready(function() { 

	tableInitializer.init();

	// Init Loading Indicator Bar
	loadingIndicator.init($("#loader-bar"));

	// Load AdUnits
	adUnitManager.loadAdUnits("list-name-id", function(adUnitList) {
		if (adUnitList) {
			$("#info-adunit-name").html("Please Select Ad Unit Id");
			let input = $("#adunit-selector")[0];
			let menuAdUnitTagify = new Tagify(input, {
				mode: "select",
				enforceWhitelist: true,
				whitelist: adUnitList,
				keepInvalidTags: false,
				placeholder: "Select or search ad unit or id",
				skipInvalid: true,
				dropdown: {
					position: "all",
					maxItems: Infinity,
					closeOnSelect: true
				}
			});
			menuAdUnitTagify.on('add', function(e) {
				let selectedValue = e.detail.data.value;
				let adUnitId = selectedValue.match(/.*\(([0-9|a-z]{32})\).*/)[1];
				console.log(`Loading waterfall for ad unit ${selectedValue}`);
				loadWaterfall(adUnitId, function() {
					$(".button, .search-table-wrapper").removeClass('disabled');
					console.log("Eanbling all buttons");
				});
			});
		}
	});

	// Load Account Info
	accountManager.updateHtmlEmail();

	// Version Update
	$(".wb-version").html(`v${chrome.runtime.getManifest().version}`);	

	// Column Selector
	let colDefs = WaterfallTable.getColumnDefinitions(); // Get column definition array
	for(let i =0; i < colDefs.length; i++) {
		if (colDefs[i]["field"]) {
			let checked = colDefs[i].visible == true ? "checked" : "";
			let html = ` 
			<div class="ui item checkbox tiny" data-value="${colDefs[i].field}">
        <input type="checkbox" name="${colDefs[i].field}" ${checked}>
        <label>${colDefs[i].title}</label>
      </div>`;
			$(".scrolling.menu").append(html);
		}
	}

	// Column Select
	$("#column-selector").dropdown({
		action: function(text, value, element) {
			WaterfallTable.toggleColumn(value);
			WaterfallTable.redraw();
		}
	});

	// Init Checkboxes
	$('.ui.checkbox').checkbox();

	// Init Edit Form
	editFormManager.initForm();
	
	// Copy Mode (Copy waterfall form)
	$("#copy-mode").dropdown({ showOnFocus: false	});

	// Disable all buttons
	if (AdUnitId == undefined) {
		$(".button, .search-table-wrapper").addClass('disabled');
		console.log("Disabling all buttons");
	}

	// Status Filter Init
	$('#status-filter').dropdown({
		onChange: function(value, text, element) {
			switch (value) {
				case "running":
					WaterfallTable.setFilter("status", "=", "running");
					break;
				case "paused":
					WaterfallTable.setFilter("status", "=", "paused");
					break;
				case "archived":
					WaterfallTable.setFilter("status", "=", "archived");
					break;
				default:
					WaterfallTable.clearFilter(true);
					break;
			}
		}
	});
	// $("#status-filter").dropdown('set selected', "running");

	$('#status-filter-lineitem').dropdown({
		onChange: function(value, text, element) {
			switch (value) {
				case "running":
					LineItemTable.setFilter("status", "=", "running");
					break;
				case "paused":
					LineItemTable.setFilter("status", "=", "paused");
					break;
				case "archived":
					LineItemTable.setFilter("status", "=", "archived");
					break;
				default:
					LineItemTable.clearFilter(true);
					break;
			}
		}
	});
	// $("#status-filter-lineitem").dropdown('set selected', "running");

	$('#status-filter-order').dropdown({
		onChange: function(value, text, element) {
			switch (value) {
				case "running":
					OrderTable.setFilter("status", "=", "running");
					break;
				case "paused":
					OrderTable.setFilter("status", "=", "paused");
					break;
				case "archived":
					OrderTable.setFilter("status", "=", "archived");
					break;
				default:
					OrderTable.clearFilter(true);
					break;
			}
		}
	});
	// $("#status-filter-order").dropdown('set selected', "running");

});


