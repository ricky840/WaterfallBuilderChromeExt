var toast = (function(global) {
  "use strict";

  function show(notification) {
    let type = "blue";
    switch (notification.type) {
      case "positive":
        type = "success";
        break;
      case "negative":
        type = "error";
        break;
      case "info":
        type = "warning";
        break;
      default:
        type = "blue";
        break;
    }

    $('body').toast({
      class: type,
      title: notification.header,
      message: notification.message,
      showProgress: "bottom"
    });
  }
 
  return {
		show: show
  }
})(this);
