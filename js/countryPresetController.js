var countryPresetController = (function(global) {
	"use strict";

  function getFullCountryName(countryCode) {
    for (const each of COUNTRY_LIST) {
      if (each.country_code == countryCode) {
        return each.country;
      }
    }
  }

  function enableTagify() {
    const inputs = $(".country-preset-table-body input");
    if (inputs.length == 0) return;
   
    /**
     * Tagify requires "value" in data
     */
    let newCountryList = [];
    COUNTRY_LIST.forEach(eachCountry => {
      newCountryList.push({
        value: eachCountry.country_code,
        country: eachCountry.country,
        country_code: eachCountry.country_code
      });
    });

    /**
     * After update preset in MoPub, show notification 
     */
    let afterPresetUpdated = function(result, tagify) {
      if (!result) {
        toast.show(NOTIFICATIONS.countryPresetUpdateFailed);
        tagify.removeTags(); // Remove last added tag
        return;
      }
      toast.show(NOTIFICATIONS.countryPresetUpdateSuccess);
    };

    /**
     * For each input tag, apply tagify. See https://github.com/yairEO/tagify for option desc.
     */
    inputs.each(function(index) {
      let tagify = new Tagify(this, {
        tagTextProp: 'country',
        enforceWhitelist: true,
        skipInvalid: true,
        dropdown: {
            closeOnSelect: false,
            enabled: 0,
            maxItems: 1000,
            mapValueTo: "country",
            searchKeys: ['country_code', 'country']
        },
        whitelist: newCountryList,
        callbacks: { // These callbacks doesn't support async, so had to use callback
          add: (event) => {
            const key = $(this).attr("key");
            const tagList = event.detail.tagify.value;
            updatePresetInMoPub(key, tagList, tagify, afterPresetUpdated);
          },
          remove: (event) => {
            const key = $(this).attr("key");
            const tagList = event.detail.tagify.value;
            if (_.isEmpty(tagList)) return; // Last tag can't be removed.
            updatePresetInMoPub(key, tagList, tagify, afterPresetUpdated);
          }
        }
      });
    });
  }

  async function updatePresetInMoPub(key, tagList, tagify, callback) {
    if (_.isEmpty(key)) return false;

    let countryCodes = [];
    tagList.forEach(tag => {
      countryCodes.push(tag.value);
    });

    let postData = { key: key, countries: countryCodes };

    try {
      await moPubApi.updateCountryPreset(postData);
      callback(true, tagify);
    } catch (error) {
      console.log(error);
      callback(false, tagify);
      return;
    }
  }

  function createHtml(list) {
    let html = "";
    list.forEach(preset => {
      let countryFullNames = [];
      preset.countries.forEach(countryCode => {
        countryFullNames.push(getFullCountryName(countryCode));
      });
      html += `
        <tr>
          <td>
            <h5 class="ui header">${preset.name}</h5>
          </td>
          <td>
            <input class="country-preset-list" value="${preset.countries}" key="${preset.key}">
          </td>
          <td>
            <button class="ui grey tertiary small button country-preset-load">Load</button>
            <button class="ui grey tertiary small button country-preset-delete">Delete</button>
          </td>
        </tr>`;
    });
    return html;
  }

  function load() {
    return new Promise(async (resolve, reject) => {
      let html = "";
      try {
        const presetList = await moPubApi.getCountryPreset();
        if (_.isEmpty(presetList)) {
          html = `
          <tr>
            <td class="center aligned" colspan="3" style="height: 5em;">No Presets</td>
          </tr>`;
        } else {
          html = createHtml(presetList);
        }
      } catch (error) {
        console.log(error);
        html = `
        <tr>
          <td class="center aligned" colspan="3" style="height: 5em;">Error occured while loading presets</td>
        </tr>`;
        reject();
      }

      $(".country-preset-table-body").html(html);
      if (!_.isEmpty(html)) enableTagify();
      resolve();
    });
  }

  function getCountryCodesByPresetKey(presetKey) {
    let countryList = $(`.edit-modal-load-country-preset input[key=${presetKey}]`).val();
    try {
      countryList = JSON.parse(countryList);
    } catch (error) {
      console.log(error)
      return [];
    }
    if (_.isEmpty(countryList)) return [];

    let countryCodes = [];
    countryList.forEach(each => {
      countryCodes.push(each.country_code);
    });

    return countryCodes;
  }

  function deleteCountryPreset(presetKey) {
    return new Promise(async (resolve, reject) => {
      const postData = { key: presetKey };
      try {
        await moPubApi.deleteCountryPreset(postData);
        resolve();
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  }

  function createCountryPreset(name, countryCodeList) {
    return new Promise(async (resolve, reject) => {
      const postData = { name: name, countries: countryCodeList };
      try {
        await moPubApi.createCountryPreset(postData);
        resolve();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  function clear() {
    $(".country-preset-table-body").html("");
    $("input[name=new-country-preset-name]").val("");
  }

  return {
    load: load,
    clear: clear,
    getCountryCodesByPresetKey: getCountryCodesByPresetKey,
    deleteCountryPreset: deleteCountryPreset,
    createCountryPreset: createCountryPreset
  }
})(this);
