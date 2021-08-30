/**
 * BASED on the documentation provided in locationiq
 *
 * https://maps.locationiq.com/v3/samples/?sample=maps_with_autocomplete
 *
 * API Documentation:
 * https://locationiq.com/docs
 *
 */

window.onload = async function () {
    try {
        // await LoadSearchbox();

        ReloadTranslation();
    } catch (e) {}
};

/**
 * Location IQ Related
 */

// Unused for now
async function LoadMap() {
    // Get the API key
    let locationiqKey = document
        .querySelector('#location-iq-apikey')
        .innerHTML.trim();

    //Define the map and configure the map's theme
    let map = new mapboxgl.Map({
        container: 'map',

        //need this to show a compact attribution icon (i) instead of the whole text
        attributionControl: false,
        style:
            'https://tiles.locationiq.com/v3/streets/vector.json?key=' +
            locationiqKey,
        zoom: 12,
        center: [-122.42, 37.779],
    });

    //Add Geocoder control to the map
    map.addControl(
        new MapboxGeocoder({
            accessToken: locationiqKey,
            mapboxgl: mapboxgl,
            limit: 5,
            dedupe: 1,
            marker: {
                color: 'red',
            },
            flyTo: {
                screenSpeed: 7,
                speed: 4,
            },
        }),
        'top-left'
    );
}

async function SearchPlace(e) {
    let inputText = e.value.trim();
    if (inputText.length > 2) {
        // Get items from backend

        // Display suggestinos
        document
            .querySelector('.autocomplete-section')
            .classList.remove('hidden');
    } else {
        // Hide suggestions
        document.querySelector('.autocomplete-section').classList.add('hidden');
    }
}

// ==============================
// END OF LOCATION IQ RELATED JAVASCRIPT
// ==============================

document
    .querySelector('#btn-final-submit')
    .addEventListener('click', async function () {
        // Get the coordinates
        let long = document.querySelector('#input-long').value;
        let lat = document.querySelector('#input-lat').value;

        if (!long && !lat) {
            let text = document.querySelector(
                '#sweet-text_CustomerAddressCannotBeBlank'
            ).innerHTML;
            DisplaySweetAlertInfo(text);

            return;
        }

        // Main Search box string
        let address = document.querySelector('#pac-input').value;
        if (!address) {
            let text = document.querySelector(
                '#sweet-text_CustomerAddressCannotBeBlank'
            ).innerHTML;
            DisplaySweetAlertInfo(text);
            return;
        }

        let displayAddress = document.querySelector(
            '#address-info-customer-address'
        ).innerHTML;

        let addressInfoFlag = document.querySelector(
            '#ejs-var-address-info-flag'
        ).value;

        addressInfoFlag = addressInfoFlag === 'true';

        // If there are extra address fields, grab them
        let addressInfoArray = [];
        let extraInfo = ``;
        if (addressInfoFlag) {
            // Get the address fields
            let addressFieldsDiv = document.querySelector('.address-fields');
            // Get the inputs inside it
            let addressFieldsArray = Array.from(
                addressFieldsDiv.querySelectorAll(
                    'input[type="text"], textarea'
                )
            );

            // Concatenate them into one big ass string
            for (let x = 0; x < addressFieldsArray.length; x++) {
                let currentFieldValue = addressFieldsArray[x];
                console.log('CURRENT FIELD: ', currentFieldValue.name);
                console.log(currentFieldValue);
                let value = currentFieldValue.value.trim()
                    ? currentFieldValue.value.trim()
                    : '';

                if (value) {
                    value = value.split('&').join('and');
                }

                extraInfo += value + ' ';
            }
        }

        document.querySelector('.modal-body').innerHTML = `
        <p>${displayAddress} ${extraInfo}</p>
        `;

        // Display modal
        $('#modalyesno').modal({
            keyboard: false,
            focus: true,
        });

        return;
    });

document
    .querySelector('#btn-modal-yes')
    .addEventListener('click', async function (e) {
        let long = document.querySelector('#input-long').value;
        let lat = document.querySelector('#input-lat').value;
        let address = document.querySelector('#pac-input').value;

        let displayAddress = document.querySelector(
            '#address-info-customer-address'
        ).innerHTML;

        let addressInfoFlag = document.querySelector(
            '#ejs-var-address-info-flag'
        ).value;

        addressInfoFlag = addressInfoFlag === 'true';

        // If there are extra address fields, grab them
        let addressInfoArray = [];
        if (addressInfoFlag) {
            // Get the address fields
            let addressFieldsDiv = document.querySelector('.address-fields');
            // Get the inputs inside it
            let addressFieldsArray = Array.from(
                addressFieldsDiv.querySelectorAll(
                    'input[type="text"], textarea'
                )
            );
            for (let x = 0; x < addressFieldsArray.length; x++) {
                let currentFieldValue = addressFieldsArray[x];
                console.log('CURRENT FIELD: ', currentFieldValue.name);
                console.log(currentFieldValue);
                let value = currentFieldValue.value.trim()
                    ? currentFieldValue.value.trim()
                    : null;

                if (value) {
                    value = value.split('&').join('and');
                }

                let label = currentFieldValue.placeholder;
                label = label.split('Enter');
                label = label[1].trim();
                let addressObject = {
                    field: currentFieldValue.name,
                    label,
                    // label: currentFieldValue.placeholder.substring(6),
                    value,
                };
                addressInfoArray.push(addressObject);
            }
        }

        let queryObj = GetQueryObject();
        let data = {
            queryObj,
            lat,
            long,
            address: displayAddress.trim(),
            orderpreference: queryObj.orderpreference,
        };

        if (addressInfoArray.length > 0) {
            data.addressInfoArray = addressInfoArray;
        }

        //Send the JSON to the backend
        let fetchResponse = await fetch('save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .catch((e) => {
                console.log('Fetch ERR!');
                console.log(e);
                DisplaySweetAlertError(e);
            });

        ResponseHandler(fetchResponse);
    });

document
    .querySelector('#btn-modal-no')
    .addEventListener('click', async function (e) {
        Swal.fire(
            'Please make sure address information is correct!',
            '',
            'info'
        );
    });

function ResponseHandler(response) {
    let { status } = response;
    switch (status) {
        case 'success':
            let { isFacebook } = response.data;
            CloseWebview(isFacebook);
            break;
        case 'error':
            let { message } = response;
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled Response!');
            break;
    }
    ReloadTranslation();
}
