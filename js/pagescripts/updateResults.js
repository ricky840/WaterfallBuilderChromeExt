$(document).ready(function() { 
  chrome.storage.local.get("updateResults", function(result) {
    const updateResults = result['updateResults'];
    const failResults = updateResults.fail;

    failResults.forEach(eachFail => {
      let parsedResponse = "";
      try {
        parsedResponse = JSON.stringify(JSON.parse(eachFail.response), null, 2);
      } catch (e) {
        parsedResponse = eachFail.response;
      }
      const html = `
        <tr>
          <td>${eachFail.lineItemKey}</td>
          <td><pre class="mopub-update-result-pre">${parsedResponse}</pre></td>
        </tr>`;
      $("tbody").append(html);
    });
  }); 
});