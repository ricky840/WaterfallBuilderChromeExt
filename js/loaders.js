var loaders = (function(global) {
	"use strict";

  const classNames = {
    adunit: "loader-except-menu-bar",
    body: "loader-entire-body"
  };

	function show(location) {
    $(`.${classNames[location]}`).removeClass("disabled").addClass("active");
    return;
	}

	function hide(location) {
    $(`.${classNames[location]}`).removeClass("active").addClass("disabled");
    return;
	}
 
  return {
    show: show,
    hide: hide
  }
})(this);
