var moPubApi = (function(global) {
	"use strict";

  const MOPUB_API_DOMAIN = "api.mopub.com";
  const BASE_URL = `https://${MOPUB_API_DOMAIN}`;
  const MOPUB_API_AUTH_HEADER = "X-API-KEY";
	const MOPUB_PAGE_ITEM_LIMIT = 100;

  const GET_ADUNITS = "/v2/adunits";
	const GET_LINE_ITEMS = "/v2/line-items";
	const GET_AB_LINE_ITEMS = "/v2/advanced-bidding-settings";
	const GET_ORDERS = "/v2/orders";
	const CREATE_LINE_ITEM = "/v2/line-items";
	const CREATE_ORDER = "/v2/orders";
	const UPDATE_LINE_ITEM = "/v2/line-items";

	// Internal APIs, should be updated later on
	const COPY_LINE_ITEM = "https://app.mopub.com/web-client/api/line-items/copy";
	const GET_USERS = "https://app.mopub.com/web-client/api/users/query";
	const GET_ACCOUNT = "https://app.mopub.com/web-client/api/account/get";
	const CREATE_LINE_ITEM_INTERNAL = "https://app.mopub.com/web-client/api/line-items/create"; // POST
	const LOAD_COUNTRY_PRESET = "https://app.mopub.com/web-client/api/country-presets/all?orderBy=name";
	const CREATE_COUNTRY_PRESET = "https://app.mopub.com/web-client/api/country-presets/create";
	const DELETE_COUNTRY_PRESET = "https://app.mopub.com/web-client/api/country-presets/delete"; // POST
	const UPDATE_COUNTRY_PRESET = "https://app.mopub.com/web-client/api/country-presets/update";

	/**
	 * Delay - to avoid rate limiting
	 */
	const delay = (ms) => {
		return new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	};

	function mergeResponseData(responses) {
		let finalData = [];
		responses.forEach(res => {
			finalData = finalData.concat(res.data);	
		});
		return finalData;
	}

	function hasMorePages(response) {
		if (!("pagination" in response)) return 0;
		return response.pagination.lastPage;
	}

	function getAllPageResult(url, currentPageNum, lastPageNum) {
		return new Promise(async (resolve, reject) => {
			let taskList = [];
			for (let i=currentPageNum + 1; i <= lastPageNum; i++) {
				const task = new Promise(async (resolve, reject) => { 
					let requestUrl = new URL(url);
					requestUrl.searchParams.set("page", i);
					requestUrl.searchParams.set("limit", MOPUB_PAGE_ITEM_LIMIT);
					const request = { 
						url: requestUrl.toString(),
						headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key }
					};
					try {
						const result = await http.getRequest(request);
						resolve(result);
					} catch (error) {
						reject(error);
					}
				});
				taskList.push(task);
			}
			// Promises are ready
			Promise.allSettled(taskList).then((results) => {
				let values = [];
				results.forEach(each => {
					values.push(each.value);
				});
				resolve(values);
			});
		});
	}

  function getAdUnits() {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + GET_ADUNITS + `?limit=${MOPUB_PAGE_ITEM_LIMIT}`,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key }
      };

			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				const lastPageNum = hasMorePages(response);
				const currentPageNum = 1; // It will be always 1
				let adUnitList = mergeResponseData([response]);

				// There is no additional pages
				if (lastPageNum == 0) {
					resolve(adUnitList);
					return;
				}

				let pageResponses = [];
				const pageResults = await getAllPageResult(request.url, currentPageNum, lastPageNum);
				pageResults.forEach(eachResult => {
					const response = JSON.parse(eachResult.responseText);
					pageResponses.push(response);
				});

				adUnitList = adUnitList.concat(mergeResponseData(pageResponses));
				resolve(adUnitList);
			} catch (error) {
				// When first request fails
				reject(error);
			}
		});
	}

	function getLineItemsByAdUnit(adUnitKey) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + GET_LINE_ITEMS + `?adUnitKey=${adUnitKey}&limit=${MOPUB_PAGE_ITEM_LIMIT}`,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key}
      };

			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				const lastPageNum = hasMorePages(response);
				const currentPageNum = 1; // It will be always 1
				let lineItemList = mergeResponseData([response]);

				// There is no additional pages
				if (lastPageNum == 0) {
					resolve(lineItemList);
					return;
				}

				let pageResponses = [];
				const pageResults = await getAllPageResult(request.url, currentPageNum, lastPageNum);
				pageResults.forEach(eachResult => {
					const response = JSON.parse(eachResult.responseText);
					pageResponses.push(response);
				});

				lineItemList = lineItemList.concat(mergeResponseData(pageResponses));
				resolve(lineItemList);
			} catch (error) {
				// When first request fails
				reject(error);
			}
		});
	}

	function getLineItemsByOrder(orderKey) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + GET_LINE_ITEMS + `?orderKey=${orderKey}&limit=${MOPUB_PAGE_ITEM_LIMIT}`,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key}
      };

			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				const lastPageNum = hasMorePages(response);
				const currentPageNum = 1; // It will be always 1
				let lineItemList = mergeResponseData([response])

				// There is no additional pages
				if (lastPageNum == 0) {
					resolve(lineItemList);
					return;
				}

				let pageResponses = [];
				const pageResults = await getAllPageResult(request.url, currentPageNum, lastPageNum);
				pageResults.forEach(eachResult => {
					const response = JSON.parse(eachResult.responseText);
					pageResponses.push(response);
				});

				lineItemList = lineItemList.concat(mergeResponseData(pageResponses));
				resolve(lineItemList);
			} catch (error) {
				// When first request fails
				reject(error);
			}
		});
	}

	function getLineItemsByOrders(orderKeyList) {
		return new Promise(async (resolve, reject) => {
			let taskList = [];

			orderKeyList.forEach(orderKey => {
				const task = getLineItemsByOrder(orderKey);
				taskList.push(task);
			});

			// Promises are ready
			Promise.allSettled(taskList).then((results) => {
				let values = [];
				results.forEach(each => {
					values.push(each.value);
				});
				resolve(values);
			});
		});
	}

	function getOrders() {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + GET_ORDERS + `?limit=${MOPUB_PAGE_ITEM_LIMIT}`,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key }
      };

			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				const lastPageNum = hasMorePages(response);
				const currentPageNum = 1; // It will be always 1
				let orderList = mergeResponseData([response]);

				// There is no additional pages
				if (lastPageNum == 0) {
					resolve(orderList);
					return;
				}

				let pageResponses = [];
				const pageResults = await getAllPageResult(request.url, currentPageNum, lastPageNum);
				pageResults.forEach(eachResult => {
					const response = JSON.parse(eachResult.responseText);
					pageResponses.push(response);
				});

				orderList = orderList.concat(mergeResponseData(pageResponses));
				resolve(orderList);
			} catch (error) {
				// When first request fails
				reject(error);
			}
		});
	}

	function createNewLineItem(postData, lineItemKey, delayMs) {
		return new Promise(async (resolve, reject) => { 
			// Delay between requests
			await delay(delayMs);

			const request = { 
        url: BASE_URL + CREATE_LINE_ITEM,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				const response = {
					mopubResponse: JSON.parse(result.responseText),
					lineItemKey: lineItemKey
				};
				resolve(response);
			} catch (error) {
				const errorResponse = {
					error: error,
					lineItemKey: lineItemKey
				};
				reject(errorResponse);
			}

			progressBar.increase();
		});
	}

	function createNewLineItemViaOldApi(postData, lineItemKey, delayMs) {
		return new Promise(async (resolve, reject) => { 
			// Delay between requests
			await delay(delayMs);

			const request = { 
        url: CREATE_LINE_ITEM_INTERNAL,
				headers: { "Content-Type": "application/json; charset=utf-8" },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				const response = {
					mopubResponse: JSON.parse(result.responseText),
					lineItemKey: lineItemKey
				};
				resolve(response);
			} catch (error) {
				const errorResponse = {
					error: error,
					lineItemKey: lineItemKey
				};
				reject(errorResponse);
			}

			progressBar.increase();
		});
	}

	function createNewOrder(postData) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + CREATE_ORDER,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch (error) {
				const errorResponse = {
					error: error,
					lineItemKey: "" // There is no line item key for this
				};
				reject(errorResponse);
			}
		});
	}	

	function updateLineItem(changeData, lineItemKey, delayMs) {
		return new Promise(async (resolve, reject) => {
			// Delay between requests
			await delay(delayMs);

			const putData = {
				op: "set",
				data: changeData
			};
			const request = { 
        url: BASE_URL + UPDATE_LINE_ITEM + "/" + lineItemKey,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key },
				data: putData
      };

			try {
				const result = await http.putRequest(request);
				const response = {
					mopubResponse: JSON.parse(result.responseText),
					lineItemKey: lineItemKey
				};
				resolve(response);
			} catch (error) {
				const errorResponse = {
					error: error,
					lineItemKey: lineItemKey
				};
				reject(errorResponse);
			}

			progressBar.increase();
		});
	}

	function copyLineItem(postData, delayMs) {
		return new Promise(async (resolve, reject) => { 
			// Delay between requests
			await delay(delayMs);

			const lineItemKey = postData.key;
			const request = { 
        url: COPY_LINE_ITEM,
				headers: { "Content-Type": "application/json; charset=utf-8" },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch (error) {
				const errorResponse = {
					error: error,
					lineItemKey: lineItemKey
				};
				reject(errorResponse)
			}

			progressBar.increase();
		});
	}

	function getAbLineItemsByAdUnit(adUnitKey) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: BASE_URL + GET_AB_LINE_ITEMS + `/${adUnitKey}`,
        headers: { [MOPUB_API_AUTH_HEADER]: apiKeyManager.getActiveApiKey().key }
      };

			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch (error) {
				reject(error);
			}
		});
	}

	function getUsers() {
		return new Promise(async (resolve, reject) => { 
			let request = { url: GET_USERS };
			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch(error) {
				reject(error);
			}
		});
	}

	function getAccount() {
		return new Promise(async (resolve, reject) => { 
			let request = { url: GET_ACCOUNT };
			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch(error) {
				reject(error);
			}
		});
	}

	function getCountryPreset() {
		return new Promise(async (resolve, reject) => { 
			let request = { url: LOAD_COUNTRY_PRESET };
			try {
				const result = await http.getRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch(error) {
				reject(error);
			}
		});
	}

	function deleteCountryPreset(postData) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: DELETE_COUNTRY_PRESET,
				headers: { "Content-Type": "application/json; charset=utf-8" },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				// This API returns nothing when success
				// const response = JSON.parse(result.responseText);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
	
	function updateCountryPreset(postData) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: UPDATE_COUNTRY_PRESET,
				headers: { "Content-Type": "application/json; charset=utf-8" },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				// This API returns nothing when success
				// const response = JSON.parse(result.responseText);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}

	function createCountryPreset(postData) {
		return new Promise(async (resolve, reject) => { 
			const request = { 
        url: CREATE_COUNTRY_PRESET,
				headers: { "Content-Type": "application/json; charset=utf-8" },
				data: postData
      };

			try {
				const result = await http.postRequest(request);
				const response = JSON.parse(result.responseText);
				resolve(response);
			} catch (error) {
				reject(error);
			}
		});
	}

  return {
		getAdUnits: getAdUnits,
		getLineItemsByAdUnit: getLineItemsByAdUnit,
		getAbLineItemsByAdUnit: getAbLineItemsByAdUnit,
		getLineItemsByOrder: getLineItemsByOrder,
		getLineItemsByOrders: getLineItemsByOrders,
		getOrders: getOrders,
		createNewLineItem: createNewLineItem,
		createNewOrder: createNewOrder,
		updateLineItem: updateLineItem,
		copyLineItem: copyLineItem,
		getUsers: getUsers,
		getAccount: getAccount,
		createNewLineItemViaOldApi: createNewLineItemViaOldApi,
		getCountryPreset: getCountryPreset,
		deleteCountryPreset: deleteCountryPreset,
		updateCountryPreset: updateCountryPreset,
		createCountryPreset: createCountryPreset
  }
})(this);
