var infoPanelManager = (function(global) {
	"use strict";

  function qrCodeGen(key, format) {
    let AdFormat = "";

    switch(format) {
      case "banner":
        AdFormat = "Banner";
        break;
      case "medium_rectangle":
        AdFormat = "MediumRectangle";
        break;
      case "fullscreen":
        AdFormat = "Interstitial";
        break;
      case "native":
        AdFormat = "Native";
        break;
      case "rewarded_video":
        AdFormat = "Rewarded";
        break;
      case "rewarded":
        AdFormat = "Rewarded";
        break;
      default:
        return; // Error return
        break;
    }
   
    $("#qrcode").empty();
    let div = $("#qrcode")[0];
    const testName = `${AdFormat}_${new Date().getTime()}`;
    const url = `mopub://load?adUnitId=${key}&format=${AdFormat}&name=${testName}`;
    const qrcode = new QRCode(div, {
      text: url,
      width: 100,
      height: 100
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
    update: update
  }
})(this);
