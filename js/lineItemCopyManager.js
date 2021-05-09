var lineItemCopyManager = (function(global) {
  "use strict";

	function createPostDataUnderSameOrder(lineItems, userData) {
		let postDatas = [];
		lineItems.forEach(lineItem => {
			postDatas.push({
				key: lineItem.key,
				active: true,
				copyCreatives: true,
				lineItemName: lineItem.name + " " + userData.lineItemNameSuffix,
				orderKey: lineItem.orderKey,
				startImmediately: true
			});
		});
		return postDatas;
	}

	function createPostDataWithNewOrder(lineItems, userData) {
		return new Promise(async (resolve, reject) => {
			const postData = {
				advertiser: NEW_ORDER_ADVERTISER,
				description: NEW_ORDER_DESC,
				name: "New Order" + " " + userData.orderNameSuffix + " " + getCurrentDatetimeUTC()
				// status: "running" // Status wasn't accepted unlike the document
			};
			let newOrderKey = "";

			try {
				const response = await moPubApi.createNewOrder(postData);
				newOrderKey = response.data.key;
				if (_.isEmpty(newOrderKey)) throw "Order wasn't created successfully";
			} catch (error) {
				reject(error);
				return;
			}

			// New order is ready
			let postDatas = [];
			lineItems.forEach(lineItem => {
				postDatas.push({
					key: lineItem.key,
					active: true,
					copyCreatives: true,
					lineItemName: lineItem.name + " " + userData.lineItemNameSuffix,
					orderKey: newOrderKey,
					startImmediately: true
				});
			});

			resolve(postDatas);
		});
	}

	function createPostDataWithExistingOrder(lineItems, userData) {
		let postDatas = [];
		lineItems.forEach(lineItem => {
			postDatas.push({
				key: lineItem.key,
				active: true,
				copyCreatives: true,
				lineItemName: lineItem.name + userData.lineItemNameSuffix,
				orderKey: userData.orderKey,
				startImmediately: true
			});
		});
		return postDatas;
	}

	function createPostDataWithNewOrders(lineItems, userData) {
		return new Promise(async (resolve, reject) => {
			/**
			 * Create a data structure as follow first to see how many orders are required.
				{
					"orderKey1":[
						lineitem1,
						lineitem2
					],
					"orderKey2":[
						lineitem1
					]
				}
			 * Then create each order with the line items using "createPostDataWithNewOrder"
			 */
			let orderKeyToLineItemMapping = {};
			lineItems.forEach(lineItem => {
				if (lineItem.orderKey in orderKeyToLineItemMapping) {
					orderKeyToLineItemMapping[lineItem.orderKey].push(lineItem);
				} else {
					orderKeyToLineItemMapping[lineItem.orderKey] = [lineItem];
				}
			});

			let postDatas = [];
			for (const orderKey in orderKeyToLineItemMapping) {
				const lineItemList = orderKeyToLineItemMapping[orderKey];
				if (_.isEmpty(lineItemList)) continue;
				try {
					const data = await createPostDataWithNewOrder(lineItemList, userData);
					postDatas.push(...data);   
				} catch (error) {
					reject(error);
					return;
				}
			}

			resolve(postDatas);
		});
	}

	async function copy(lineItems, userData) {
		return new Promise(async (resolve, reject) => {
			let promiseTasks = [];
			let postDatas = [];

			// Do not copy these line item types
			const filteredLineItems = lineItems.filter(lineItem => {
				return (lineItem.type != "marketplace" 
					&& lineItem.type != "advanced_bidding_mpx" 
					&& lineItem.type != "advanced_bidding_network" 
					&& lineItem.type != "pmp_line_item"
					&& lineItem.type != "segment");
			});

			try {
				if (userData.copyMode == "in_same_order") {
					postDatas = createPostDataUnderSameOrder(filteredLineItems, userData);
				} else if (userData.copyMode == "in_one_new_order") {
					postDatas = await createPostDataWithNewOrder(filteredLineItems, userData);
				} else if (userData.copyMode == "in_one_existing_order") {
					postDatas = createPostDataWithExistingOrder(filteredLineItems, userData);
				} else if (userData.copyMode == "in_new_order_with_neighbour") {
					postDatas = await createPostDataWithNewOrders(filteredLineItems, userData);
				}
			} catch (error) {
				console.log(`There was an error creating order: ${error}`);
				reject(error);
				return;
			}

			// Order is ready. Create line items (copy).
			postDatas.forEach(data => {
				promiseTasks.push(moPubApi.copyLineItem(data));
			});

			// Copying line items. Make sure all promises are success
			Promise.all(promiseTasks).then(async (results) => {
				console.log("Copying line items complete. See results below.");
				console.log(results);

				let createdLineItems = [];
				results.forEach(result => {
					const createdLineItem = result;
					createdLineItems.push(createdLineItem);
				});

				// All line items were copied, override the ad unit key.
				try {
					await overrideAdUnitKey(createdLineItems, userData.adUnitKey);
					resolve(true);
					console.log("Line Item were successfully duplicated");
				} catch (e) {
					console.log(`There was an error while updating AdUnitKeys for copied line items ${e}`);
					reject(e);
					return;
				}
			}).catch(error => {
				// Error while copying line items. Stop task and return.
				console.log(`There was an error while copying line items ${error}`);
				reject(error);
				return;
			});
		});
	}

	function overrideAdUnitKey(lineItems, adUnitKey) {
		return new Promise((resolve, reject) => {
			let promiseTasks = [];

			lineItems.forEach(lineItem => {
				const putData = {
					adUnitKeys: [adUnitKey]
				};
				promiseTasks.push(moPubApi.updateLineItem(putData, lineItem.key));
			});

			Promise.all(promiseTasks).then((results) => {
				resolve(results);
			}).catch(error => {
				// Error while updating AdUnitKeys for copied line items
				reject(error);
				return;
			});
		});
	}

  return {
		copy: copy
  }
})(this);
