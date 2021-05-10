var loaders = (function(global) {
	"use strict";

  const classNames = {
    adunit: "loader-except-menu-bar",
    body: "loader-entire-body",
    lineItemTable: "loader-lineitem-table"
  };

	function show(location) {
    $(`.${classNames[location]} .text`).html("");
    $(`.${classNames[location]}`).removeClass("disabled").addClass("active");
    setTimeout(() => { 
      $(`.${classNames[location]} .text`).html("Please wait..");
    }, 6000);
    setTimeout(() => { 
      $(`.${classNames[location]} .text`).html("Still working..");
    }, 12000);
    return;
	}

	function hide(location) {
    $(`.${classNames[location]}`).removeClass("active").addClass("disabled");
    $(`.${classNames[location]} .text`).html("");
    return;
	}
 
  return {
    show: show,
    hide: hide
  }
})(this);
