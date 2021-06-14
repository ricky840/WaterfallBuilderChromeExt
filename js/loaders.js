var loaders = (function(global) {
	"use strict";

  let timeout1;
  let timeout2;

  const classNames = {
    adunit: "loader-except-menu-bar",
    body: "loader-entire-body",
    lineItemTable: "loader-lineitem-table",
    countryPresetModal: "loader-country-preset"
  };

	function show(location) {
    $(`.${classNames[location]} .text`).html(" ");
    $(`.${classNames[location]}`).removeClass("disabled").addClass("active");
    
    timeout1 = setTimeout(() => { 
      const loaderText = $(`.${classNames[location]} .text`).html();
      if (_.isEmpty(loaderText)) $(`.${classNames[location]} .text`).html("Please wait..");
    }, 6000);
    timeout2 = setTimeout(() => { 
      const loaderText = $(`.${classNames[location]} .text`).html();
      if (_.isEmpty(loaderText)) $(`.${classNames[location]} .text`).html("Still working..");
    }, 12000);
	}

	function hide(location) {
    $(`.${classNames[location]}`).removeClass("active").addClass("disabled");
    $(`.${classNames[location]} .text`).html("");
    clearTimeout(timeout1);
    clearTimeout(timeout2);
	}

  function setText(location, msg) {
    $(`.${classNames[location]} .text`).html(msg);
  }
 
  return {
    show: show,
    hide: hide,
    setText: setText
  }
})(this);
