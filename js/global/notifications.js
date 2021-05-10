// Type: success, negative, info
var NOTIFICATIONS = {
  "extensionUpdated": {
    "type": "info",
    "header": `Extension Updated ${EXTENSION_VERSION}`,
    "message": `See <a href="${CHANGE_LOG_URL}" target="_blank">here</a> for more details. :)`
  },
  "activeApiKeyNotAvailable": {
    "type": "negative",
    "header": "Publisher API Key is not available",
    "message": "Please activate the API key from the 'Manage API Key' in the menu bar"
  },
  "moPubUpdateSucess": {
    "type": "success",
    "header": "All line items were updated successfully",
    "message": "" // dynamic
  },
  "moPubUpdateFail": {
    "type": "negative",
    "header": "Some of the line item update failed",
    "message": "" // dynamic
  },
  "copyFormInputError": {
    "type": "negative",
    "header": "Some of the required fields are missing",
    "message": "Please provide necessary inputs to proceed"
  },
  "copyLineItemSuccess": {
    "type": "success",
    "header": "All line item were copied successfully",
    "message": "" // dynamic
  },
  "copyLineItemFail": {
    "type": "negative",
    "header": "Copy line item failed",
    "message": "" // dynamic
  },
  "importUnsuccessful": {
    "type": "negative",
    "header": "Import Unsccessful",
    "message": "" // dynamic
  },
  "importValidationError": {
    "type": "negative",
    "header": "Import Validation Error",
    "message": "" // dynamic
  },
  "importSuccessful": {
    "type": "positive",
    "header": "Import Successful",
    "message": "" // dynamic
  },
  "assignSuccess": {
    "type": "positive",
    "header": "Success",
    "message": "" // dynamic
  },
  "assignedAlready": {
    "type": "info",
    "header": "Existing Line item",
    "message": "" // dynamic
  },
  "zeroLineItemSelected": {
    "type": "negative",
    "header": "No Line Item Selected",
    "message": "Please select line items"
  },
  "requiredFieldMissing": {
    "type": "negative",
    "header": "Required Field Missing",
    "message": "Please fill out all required fields"
  },
  "columnListSaved": {
    "type": "positive",
    "header": "Success",
    "message": "Column list was saved successfuly"
  },
  "orderRequired": {
    "type": "negative",
    "header": "Order Required",
    "message": "New line item requires the order"
  },
  "overrideFieldInputError": {
    "type": "negative",
    "header": "Error",
    "message": "" // dynamic
  },
  "initFailed": {
    "type": "negative",
    "header": "Initialization Failed",
    "message": "Something went wrong during the initialzation. Please try again."
  }
};