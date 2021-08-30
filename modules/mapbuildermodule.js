module.exports = {
    GenerateAddressFields: async function (addressInfoArray) {
        try {
            console.log('\n mapbuildermodule.GenerateAddressFields');

            let modalBody = ``;
            if (addressInfoArray) {
                console.log('\n Generating additional address fields');
                console.log(addressInfoArray);

                for (let x = 0; x < addressInfoArray.length; x++) {
                    let currentField = addressInfoArray[x];
                    let currentHtml = '';
                    if (currentField.field.toUpper() === 'INSTRUCTION') {
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
};

function GenerateAddressFields() {
    // Get the value
    let addressInfoArray = document.querySelector(
        '#ejs-var-address-info-array'
    ).value;

    let modalBody = ``;
    if (addressInfoArray) {
        console.log('There are extra address fields');

        addressInfoArray = JSON.parse(addressInfoArray);
        console.log(addressInfoArray);
        for (let x = 0; x < addressInfoArray.length; x++) {
            let currentField = addressInfoArray[x];
            let currentHtml = '';
            if (currentField.field === 'INSTRUCTION') {
                // Specifically for text areas
                // prettier-ignore
                currentHtml = `
                <div class="col-md-12">
                    <div class="field-group">
                        <label class="small" data-i18n="${currentField.label}" for="${currentField.field}">
                            ${currentField.label}
                        </label>
                        <textarea 
                        class="field-input"
                        name="${currentField.field}"        
                        id="address-info-${currentField.field}" 
                        cols="30" 
                        rows="3"        
                        placeholder="Enter ${currentField.label}">${currentField.value ? currentField.value.trim() : ''}</textarea>
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
                                currentField.value ? currentField.value : ''
                            }"
                        />
                    </div>
                </div>
                `;
            }

            modalBody += currentHtml;
        }

        // Attach the fields into the modal
        let addressFields = document.querySelector('.address-fields');
        addressFields.innerHTML = modalBody;
    }
    // If null, do nothing
    else {
        console.log('There are NO extra address fields');
    }
}
