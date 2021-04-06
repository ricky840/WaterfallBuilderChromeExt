function getCurrentTimeInEpoch() {
	return new Date().getTime();
}

function stringGen(len) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}

function getCurrentDatetimeUTC(format) {
  obj_date = new Date();
  year = obj_date.getUTCFullYear();
  month = obj_date.getUTCMonth() + 1;
  date = obj_date.getUTCDate();
  hours = obj_date.getUTCHours();
  minutes = obj_date.getUTCMinutes();
  seconds = obj_date.getUTCSeconds();
	milseconds = obj_date.getMilliseconds();
  temp_arr = [year, month, date, hours, minutes, seconds, milseconds]
  for (i = 0; i < temp_arr.length; i++) {
    if (temp_arr[i] < 10) {
      temp_arr[i] = '0' + temp_arr[i];
    }
  }
  if(format == "ISO-8601") {
    return temp_arr[0] + '-' + temp_arr[1] + '-' + temp_arr[2] + 'T' 
			+ temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5] + '.' + temp_arr[6] + 'Z';
  } else {
    return temp_arr[0] + '/' + temp_arr[1] + '/' + temp_arr[2] + ' ' 
			+ temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5];
  }
}

function getCurrentDateTimeAddDaysUTC(addDays) {
	let now = new Date();
	let endDate = new Date(now.setDate(now.getDate() + addDays));
	return endDate.toISOString();
}

function clearEmpties(obj) {
  for (let key in obj) {
  	let value = obj[key];

  	if (typeof value === "object" && !_.isEmpty(value)) {
  		clearEmpties(obj[key]);
  	}

  	if (typeof value === "object" && _.isEmpty(value)) {
  		delete obj[key];
  		continue;
  	}

  	if (value === null || value === undefined || value === "") {
  		delete obj[key];
  	}
  }
  return obj;
}

function scrollToTop() {
	$(window).scrollTop(0, 0);
}

function escapeDoubleQuote(string) {
	return string.replace(/"/g, '&quot;');
}

String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function validateAdUnitKey(key) {
  const keyRegex = /^[0-9|a-z]{32}$/;
  return (keyRegex.test(key)) ? true : false;
}

function isEmptyValue(value) {
  return value === undefined 
  || value === null 
  || value === NaN 
  || (typeof value === 'object' && Object.keys(value).length === 0) 
  || (typeof value === 'string' && value.trim().length() === 0);
}