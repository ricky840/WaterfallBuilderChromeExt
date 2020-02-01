var formCreator = (function(global) {
  "use strict";

  let mixedFormHtml = ``;

  let formHtml = {
    mixed: mixedFormHtml,
    // network: networkFormHtml,
    // mpx_line_item: mpxFormHtml,
    // marketplace: marketFormHtml,
    // direct: directFormHtml
  }
 
  // mixed, network, marketplace, mpx_line_item. rests are direct
  function create(rowData) {
    let itemTypes = [];
    let formType = "mixed"; // Default form type

    for (let i=0; i < rowData.length; i++) {
      itemTypes.push(rowData[i].type);  
    }

    let types = _.uniq(itemTypes);
    if (types.length > 1) {
      formType = "mixed";
    } else if (types.length == 1) {
      switch (types[0]) {
        case "network":
          formType = "network";
          break;
        case "mpx_line_item":
          formType = "mpx_line_item";
          break;
        case "marketplace":
          formType = "marketplace";
          break;
        default:
          formType = "direct";
          break;
      }
    }


    

    // Temp
    console.log(formType);

    return formHtml['mixed'];
  }


  return {
    create: create
  }
})(this);
