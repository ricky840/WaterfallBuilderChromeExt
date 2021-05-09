var loaders = (function(global) {
	"use strict";

  const classNames = {
    adunit: "loader-except-menu-bar",
    body: "loader-entire-body",
    lineItemTable: "loader-lineitem-table"
  };

	function show(location) {
    $(`.${classNames[location]}`).removeClass("disabled").addClass("active");
    setTimeout(() => { 
      $(`.${classNames[location]} .text`).html("Still working..");
    }, 5000);
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
