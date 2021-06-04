var controlBtnManager = (function(global) {
	"use strict";

  function updateLabels(count) {
    if (count <= 0) {
      $(".control-btn").children(".label").addClass("hidden").html(count);
    } else {
      $(".control-btn").children(".label").removeClass("hidden").html(count);
    }
  }

  function enableControlBtns() {
    $(".control-btn").removeClass("disabled");
  }

  function enableNetworkBtns() {
    $(".add-network.add-item[network]").each(function(index) {
      const network = $(this).attr("network");
      if (supportedFormatValidator.supportCurrentFormat(network)) {
        $(this).removeClass("grey").addClass("blue");
        $(this).removeClass("disabled");
      } else {
        $(this).removeClass("blue").addClass("grey");
        $(this).addClass("disabled");
      }
    });
  }

  return {
    updateLabels: updateLabels,
    enableNetworkBtns: enableNetworkBtns,
    enableControlBtns: enableControlBtns
  }
})(this);
