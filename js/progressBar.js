var progressBar = (function(global) {
  "use strict";

  const bar = $("#progress-bar");
  let taskMessage = "";

  function init() {
    bar.progress();
    reset();
  }

  function reset() {
    bar.progress("reset");
    taskMessage = "";
  }

  function setTotal(total, loaderMsg = "") {
    bar.progress("set total", total);
    if (!_.isEmpty(loaderMsg)) taskMessage = loaderMsg;
  }

  function increase() {
    bar.progress("increment");
    const value = bar.progress("get value");
    const total = bar.progress("get total");
    loaders.setText("adunit", `${taskMessage} ${parseInt(value)}/${total}`);
  }

  return {
    init: init,
    reset: reset,
    setTotal: setTotal,
    increase: increase
  }
})(this);