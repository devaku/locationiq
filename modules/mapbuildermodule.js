const fetch = require('node-fetch');

module.exports = {
    GenerateAddressFields: async function (addressInfoArray) {
        try {
            console.log('\n mapbuildermodule.GenerateAddressFields');

            let modalBody = ``;
            if (addressInfoArray) {
                console.log('\n Generating additional address fields');
                console.log(JSON.stringify(addressInfoArray));

                for (let x = 0; x < addressInfoArray.length; x++) {
                    let currentField = addressInfoArray[x];
                    let currentHtml = '';
                    if (currentField.field.toUpperCase() === 'INSTRUCTION') {
                        // Specifically for text areas
                        currentHtml = `
                        <div class="col-md-12">
                            <div class="field-group">
                                <label class="small" data-i18n="${
                                    currentField.label
                                }" for="${currentField.field}">
                                    ${currentField.label}
                                </label>
                                <textarea 
                                class="field-input"
                                name="${currentField.field}"        
                                id="address-info-${currentField.field}" 
                                cols="30" 
                                rows="3"        
                                placeholder="Enter ${currentField.label}">${
                            currentField.value ? currentField.value.trim() : ''
                        }</textarea>
                            </div>
                        </div>
                        `;
                    } else {
                        // Start generating the HTML
                        currentHtml = `
                        <div class="col-md-12">
                            <div class="field-group">
                                <label class="small" data-i18n="${
                                    currentField.label
                                }" for="${currentField.field}">
                                    ${currentField.label}
                                </label>
                                <input
                                    class="field-input"
                                    type="text"
                                    name="${currentField.field}"
                                    id="address-info-${currentField.field}"
                                    placeholder="Enter ${currentField.label}"
                                    value="${
                                        currentField.value
                                            ? currentField.value
                                            : ''
                                    }"
                                />
                            </div>
                        </div>
                        `;
                    }

                    modalBody += currentHtml;
                }
            } else {
                console.log('\n There are no extra address fields');
            }
            return modalBody;
        } catch (e) {
            console.log('\n mapbuildermodule.GenerateAddressFields ERROR');
            console.log(JSON.stringify(e));
            console.log(e);
            throw e;
        }
    },

    PlacesAutoComplete: async function ({ apikey, searchTerm, viewbox = '' }) {
        try {
            // https://locationiq.com/docs

            // console.log('\n mapbuildermodule.PlacesAutoComplete');

            let query = `q=${searchTerm}`;

            // Limit results
            query += `&limit=5`;

            // Prefer results to be inside the box
            if (viewbox) {
                query += `&viewbox=${viewbox}`;
            }

            let url = `https://api.locationiq.com/v1/autocomplete.php?key=${apikey}&${query}`;

            let response = await fetch(url, {
                method: 'GET',
            })
                .then((res) => res.json())
                .catch((e) => {
                    console.log(
                        '\n mapbuildermodule.PlacesAutoComplete FETCH ERROR'
                    );
                    console.log(e);
                    console.log(JSON.stringify(e));
                    return '';
                });

            // Build the HTML
            let finalhtml = ``;
            if (response.error) {
                console.log('\n There was an error in geocoding');
                console.log(response.error);
            } else {
                if (response.length > 0) {
                    for (let i = 0; i < response.length; i++) {
                        let currentplace = response[i];
                        let template = `
                        <div class="autocomplete-suggestion" style="cursor: pointer">
                            <div class="autocomplete-suggestion-name">
                                ${currentplace.display_place}
                            </div>
                            <div class="autocomplete-suggestion-address">
                            ${currentplace.display_place} ${currentplace.display_address}
                            </div>
                            <input type="hidden" name="latitude" value="${currentplace.lat}">
                            <input type="hidden" name="longitude" value="${currentplace.lon}">
                        </div>
                        `;

                        finalhtml += template;
                    }
                }
            }
            return finalhtml;
        } catch (e) {
            console.log('\n mapbuildermodule.PlacesAutoComplete ERROR');
            console.log(e);
            console.log(JSON.stringify(e));
            return '';
        }
    },
};
