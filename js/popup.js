$(document).ready(function() { 

	tableInitializer.init();

	// Column Selector
	var colDefs = WaterfallTable.getColumnDefinitions() // Get column definition array
	for(let i =0; i < colDefs.length; i++) {
		if (colDefs[i]["field"]) {
			let checked = colDefs[i].visible == true ? "checked" : "";
			let html = ` 
			<div class="ui item checkbox tiny" data-value="${colDefs[i].field}">
        <input type="checkbox" name="${colDefs[i].field}" ${checked}>
        <label>${colDefs[i].title}</label>
      </div>`;
			$(".scrolling").append(html);
		}
	}

	// Column Select
	$("#column-selector").dropdown({
		action: function(text, value, element){
			WaterfallTable.toggleColumn(value);
		}
	});

	// Init Checkboxes
	$('.ui.checkbox').checkbox();

	// Modal
	$('.edit-dropdown').dropdown();

	// Modal targeting country
	$('#target-country').dropdown({
		onChange: function(value, text, element) {
			$("#target-country").closest('.field').removeClass('error');
		}
	});

	// Modal geo targeting mode
	$('#target-mode').dropdown({
		onChange: function(value, text, element) {
			if (value != "all") {
				$("#target-country").closest('.field').removeClass('disabled').addClass('required');
			} else {
				$("#target-country").closest('.field').addClass('disabled').removeClass('required');
				$("#target-country").dropdown('clear');
			}
		}
	});

	// Status Filter Init
	$('#status-filter').dropdown({
		onChange: function(value, text, element) {
			if (value == "all") {
				WaterfallTable.clearFilter(true);
			} else {
				WaterfallTable.setFilter("status", "=", "running");
			}
		}
	});
	// $("#status-filter").dropdown('set selected', "running");

	$('#status-filter-lineitem').dropdown({
		onChange: function(value, text, element) {
			if (value == "all") {
				LineItemTable.clearFilter(true);
			} else {
				LineItemTable.setFilter("status", "=", "running");
			}
		}
	});
	// $("#status-filter-lineitem").dropdown('set selected', "running");

	$('#status-filter-order').dropdown({
		onChange: function(value, text, element) {
			if (value == "all") {
				OrderTable.clearFilter(true);
			} else {
				OrderTable.setFilter("status", "=", "running");
			}
		}
	});
	// $("#status-filter-order").dropdown('set selected', "running");

});


