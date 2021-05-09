var copyModalController = (function(global) {
  "use strict";

  function resetForm() {
    $(".copy-mode-dropdown").dropdown('restore default value');
    $(".copy-form-order-list").dropdown('clear');
    $(".copy-adunit-dropdown").dropdown('clear');
    $("#copy-form-lineitem-suffix").val("");
    $("#copy-form-order-suffix").val("");
  }

  function parseInput(formData) {
		let userData = {};

		formData.forEach(data => {
			switch (data.name) {
				case "copy-mode":
          userData["copyMode"] = data.value;
					break;

				case "order-key":
          userData["orderKey"] = data.value;
					break;

				case "lineitem-name-suffix":
          userData["lineItemNameSuffix"] = data.value.trim();
					break;

				case "order-name-suffix":
          userData["orderNameSuffix"] = data.value.trim();
					break;

				case "adunit-key":
          userData["adUnitKey"] = data.value;
					break;
				default:
					break;
			}	
		});
		return userData;
  }

  function validateUserData(userData) {
    if (_.isEmpty(userData.copyMode)) return false;
    if (_.isEmpty(userData.orderKey) && userData.copyMode == "in_one_existing_order") return false;
    if (_.isEmpty(userData.adUnitKey)) return false;
    if (_.isEmpty(userData.lineItemNameSuffix)) userData.lineItemNameSuffix = NEW_LINE_ITEM_NAME_SUFFIX;
    if (_.isEmpty(userData.orderNameSuffix)) userData.orderNameSuffix = NEW_ORDER_NAME_POSTFIX;
    return userData;
  }

  return {
    resetForm: resetForm,
    parseInput: parseInput,
    validateUserData: validateUserData
  }
})(this);
