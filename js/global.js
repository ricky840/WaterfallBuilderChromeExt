const API_DOMAIN = "app.mopub.com";
const BASE_URL = `https://${API_DOMAIN}`;
const GET_ADUNIT = "/web-client/api/ad-units/get";
const GET_ORDERS = "/web-client/api/orders/query";
const GET_ORDER = "/web-client/api/orders/get";
const UPDATE_LINEITEM = "/web-client/api/line-items/update";
const UPDATE_ADSOURCE = "/web-client/api/ad-units/update-ad-source";

// https://app.mopub.com/web-client/api/ad-units/update-ad-source?key=ab9fd1df9cd24ab8ad0ed0d904b09061&type=gtee
// https://app.mopub.com/web-client/api/line-items/update?key=a24b5b6ae68d428597141c3d32f11802

// Tabulator Objects
var WaterfallTable, LineItemTable, OrderTable;

// Ad Unit
var AdUnitId;

// WaterfallTable Grouping Option Flag
WaterfallGrouping = true;
