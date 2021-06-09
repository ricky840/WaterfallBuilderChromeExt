$(document).ready(function() { 
  for (const network in SUPPORTED_FORMAT_FOR_NETWORK) {
    if (network == "custom" || network == "custom_native") continue;

    const formats = SUPPORTED_FORMAT_FOR_NETWORK[network];

    let listHtml = `<ul class="ui list">`;
    formats.forEach(format => {
      listHtml += `<li>${format}</li>`;
    });
    listHtml += "</ul>";

    const html = `<tr>
      <td class="field-name">${network}</td>
      <td>${listHtml}</td>
      </tr>`;

    $("tbody").append(html);
  }
});