var infoPanelManager = (function(global) {
	"use strict";

  function findFormat(format) {
    let adFormat = "";
    switch(format) {
      case "banner":
        adFormat = "Banner";
        break;
      case "medium_rectangle":
        adFormat = "MediumRectangle";
        break;
      case "fullscreen":
        adFormat = "Interstitial";
        break;
      case "native":
        adFormat = "Native";
        break;
      case "rewarded_video":
        adFormat = "Rewarded";
        break;
      case "rewarded":
        adFormat = "Rewarded";
        break;
      default:
        return; // Error return
        break;
    }
    return adFormat;
  }

  function qrCodeGen(key, format) {
    const adFormat = findFormat(format);
   
    $("#qrcode").empty();
    let div = $("#qrcode")[0];
    const testName = `${adFormat}_${new Date().getTime()}`;
    const url = `mopub://load?adUnitId=${key}&format=${adFormat}&name=${testName}`;
    const qrcode = new QRCode(div, {
      text: url,
      width: 100,
      height: 100
    });
  }

  function qrCodeGenForModal(adUnit) {
    const adFormat = findFormat(adUnit.format);
   
    $("#qrcode-big").empty();
    let div = $("#qrcode-big")[0];
    const testName = `${adFormat}_${new Date().getTime()}`;
    const url = `mopub://load?adUnitId=${adUnit.key}&format=${adFormat}&name=${testName}`;
    const qrcode = new QRCode(div, {
      text: url,
      width: 200,
      height: 200
    });
  }

  function update(adUnit) {
    $("#info-adunit-format").html(adUnit.format);
    $("#info-app-name").html(adUnit.appName);

    const adUnitKeyHtml = `<a href="${ADUNIT_PAGE_URL + adUnit.key}" target="_blank">${adUnit.key}</a>`;
    const appKeyHtml = `<a href="${APP_PAGE_URL + adUnit.appKey}" target="_blank">${adUnit.appKey}</a>`;
    $("#info-adunit-key").html(adUnitKeyHtml);
    $("#info-app-key").html(appKeyHtml);

    const dailyCap = (adUnit.dailyImpressionCap == 0) ? "Unlimited" : adUnit.dailyImpressionCap;
    const hourlyCap = (adUnit.hourlyImpressionCap == 0) ? "Unlimited" : adUnit.hourlyImpressionCap;
    const appType = (adUnit.appType == "ios") ? "iOS" : "Android";
    $("#info-daily-cap").html(dailyCap);
    $("#info-hourly-cap").html(hourlyCap);
    $("#info-platform").html(appType);

    qrCodeGen(adUnit.key, adUnit.format);
  }
 
  return {
    update: update,
    qrCodeGenForModal: qrCodeGenForModal
  }
})(this);
