// Type: success, negative, info, general
var NOTIFICATIONS = {
  "extensionUpdated": {
    id: "extensionUpdated",
    type: "general",
    header: `Publisher UI Extension is updated to v${EXTENSION_VERSION}`,
    message: `Click <a href="${CHANGE_LOG_URL}" target="_blank">here</a> for more details. <i class="surprise outline icon"></i><i class="thumbs up outline icon"></i>`,
    onetime: true
  },
  "moPubUpdateSucess": {
    id: "moPubUpdateSucess",
    type: "success",
    header: "All line items were updated successfully",
    message: "", // dynamic
    onetime: false
  },
  "moPubUpdateFail": {
    id: "moPubUpdateFail",
    type: "negative",
    header: "Some line items were failed to update",
    message: "", // dynamic
    onetime: false
  },
  "copyFormInputError": {
    id: "copyFormInputError",
    type: "negative",
    header: "Missing required fields",
    message: "Please enter all required fields",
    onetime: false
  },
  "copyLineItemSuccess": {
    id: "copyLineItemSuccess",
    type: "success",
    header: "All line items were copied successfully",
    message: "", // dynamic
    onetime: false
  },
  "copyLineItemFail": {
    id: "copyLineItemFail",
    type: "negative",
    header: "Copy incomplete due to an error",
    message: "", // dynamic
    onetime: false
  },
  "copyZeroLineItem": {
    id: "copyZeroLineItem",
    type: "info",
    header: "Unable to copy line items",
    message: "There is no source line items to copy. Please make sure the target ad unit's format is supported by the networks",
    onetime: false
  },
  "importUnsuccessful": {
    id: "importUnsuccessful",
    type: "negative",
    header: "Import unsccessful",
    message: "", // dynamic
    onetime: false
  },
  "importValidationError": {
    id: "importValidationError",
    type: "negative",
    header: "Import validation error",
    message: "", // dynamic
    onetime: false
  },
  "importSuccessful": {
    id: "importSuccessful",
    type: "positive",
    header: "Import successful",
    message: "", // dynamic
    onetime: false
  },
  "assignSuccess": {
    id: "assignSuccess",
    type: "positive",
    header: "Assign successful",
    message: "", // dynamic
    onetime: false
  },
  "assignedAlready": {
    id: "assignedAlready",
    type: "info",
    header: "Assign failed",
    message: "", // dynamic
    onetime: false
  },
  "assignedFailNotSupportedFormat": {
    id: "assignedFailNotSupportedFormat",
    type: "negative",
    header: "Assign failed",
    message: "", // dynamic
    onetime: false
  },
  "zeroLineItemSelected": {
    id: "zeroLineItemSelected",
    type: "negative",
    header: "",
    message: "Please select line items first",
    onetime: false
  },
  "requiredFieldMissing": {
    id: "requiredFieldMissing",
    type: "negative",
    header: "Missing required fields",
    message: "Please enter all required fields",
    onetime: false
  },
  "columnListSaved": {
    id: "columnListSaved",
    type: "positive",
    header: "",
    message: "Column list saved successfully",
    onetime: false
  },
  "orderRequired": {
    id: "orderRequired",
    type: "negative",
    header: "Order assignment required",
    message: "Please select an order to create new line item",
    onetime: false
  },
  "overrideFieldInputError": {
    id: "overrideFieldInputError",
    type: "negative",
    header: "Missing fields",
    message: "", // dynamic
    onetime: false
  },
  "initFailed": {
    id: "initFailed",
    type: "negative",
    header: "Initialization Failed",
    message: "Something went wrong during the initialization. Please make sure that you're logged in Publisher UI and using the right API Key.",
    onetime: false
  },
  "countryPresetUpdateFailed": {
    id: "countryPresetUpdateFailed",
    type: "negative",
    header: "Update failed",
    message: "There was an error while updating the country preset",
    onetime: false
  },
  "countryPresetUpdateSuccess": {
    id: "countryPresetUpdateSuccess",
    type: "positive",
    header: "Update successful",
    message: "Country preset was updated successfully",
    onetime: false
  },
  "countryPresetDeleteSuccess": {
    id: "countryPresetDeleteSuccess",
    type: "positive",
    header: "Delete successful",
    message: "Country preset was removed successfully",
    onetime: false
  },
  "countryPresetDeleteFailed": {
    id: "countryPresetDeleteFailed",
    type: "negative",
    header: "Delete failed",
    message: "There was an error while deleting the country preset",
    onetime: false
  },
  "countryPresetSaveEmptyName": {
    id: "countryPresetSaveEmptyName",
    type: "negative",
    header: "Missing required field",
    message: "Country preset name cannot be empty",
    onetime: false
  },
  "countryPresetSaveSuccess": {
    id: "countryPresetSaveSuccess",
    type: "positive",
    header: "Save successful",
    message: "Country preset was saved successfully",
    onetime: false
  },
  "countryPresetSaveFailedGeneric": {
    id: "countryPresetSaveFailedGeneric",
    type: "negative",
    header: "Save failed",
    message: "There was an error while saving the country preset",
    onetime: false
  },
  "countryPresetSaveFailed": {
    id: "countryPresetSaveFailed",
    type: "negative",
    header: "Save failed",
    message: "", // dynamic
    onetime: false
  },
  "adUnitIsNotLoadedYet": {
    id: "adUnitIsNotLoadedYet",
    type: "negative",
    header: "",
    message: "Please select ad unit first",
    onetime: false
  }
};