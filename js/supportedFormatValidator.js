var supportedFormatValidator = (function(global) {
  "use strict";

  function getSupportNetworksForCurrentAdFormat() {
    const currentAdFormat = adUnitManager.getCurrentAdUnit().format;
    return getSupportNetworksForAdFormat(currentAdFormat);
  }

  function getSupportNetworksForAdFormat(format) {
    let supportNetworks = [];
    for (const eachNetwork in SUPPORTED_FORMAT_FOR_NETWORK) {
      if (SUPPORTED_FORMAT_FOR_NETWORK[eachNetwork].includes(format)) {
        supportNetworks.push(eachNetwork);
      }
    }
    return supportNetworks;
  }

  function isFormatSupportedByNetwork(network, format) {
    const networkList = getSupportNetworksForAdFormat(format);
    return (networkList.includes(network)) ? true : false;
  }

  /**
   *  returns boolean
   */

  function supportCurrentFormat(network) {
    const supportNetworks = getSupportNetworksForCurrentAdFormat();
    return (supportNetworks.includes(network)) ? true : false;
  }

  return {
    getSupportNetworksForCurrentAdFormat: getSupportNetworksForCurrentAdFormat,
    getSupportNetworksForAdFormat: getSupportNetworksForAdFormat,
    isFormatSupportedByNetwork: isFormatSupportedByNetwork,
    supportCurrentFormat: supportCurrentFormat
  }
})(this);
