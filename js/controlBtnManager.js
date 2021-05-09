var controlBtnManager = (function(global) {
	"use strict";

  function updateLabels(count) {
    if (count <= 0) {
      $(".control-btn").children(".label").addClass("hidden").html(count);
    } else {
      $(".control-btn").children(".label").removeClass("hidden").html(count);
    }
  }

  return {
    updateLabels: updateLabels
  }
})(this);
