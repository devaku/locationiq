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

    // Hide suggestinos
    document.querySelector('.autocomplete-section').classList.add('hidden');

    // Clear HTML
    document.querySelector('.autocomplete-section').innerHTML = '';

    if (inputText.length > 4) {
        let queryObject = GetQueryObject();
        let apikey = document
            .querySelector('#location-iq-apikey')
            .innerHTML.trim();
        let data = {
            queryObject,
            apikey,
            searchTerm: inputText,
        };

        // Get items from backend
        let response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .catch((e) => {
                console.log('FETCH ERROR');
                console.log(e);
            });

        console.log(response);
        // esponse.status != 'success'
        if (response.status === 'success' && response.data.html) {
            let html = response.data.html;
            // Clear HTML
            document.querySelector('.autocomplete-section').innerHTML = '';

            // Insert suggestions
            document
                .querySelector('.autocomplete-section')
                .insertAdjacentHTML('afterbegin', html);

            // Attach the listeners
            await ApplyEventListeners();

            // Display suggestinos
            document
                .querySelector('.autocomplete-section')
                .classList.remove('hidden');
        } else {
            // console.log('Hiding suggestions');
            // Hide suggestions
            document
                .querySelector('.autocomplete-section')
                .classList.add('hidden');
        }
    } else {
        // Hide suggestions
        document.querySelector('.autocomplete-section').classList.add('hidden');
    }
}

async function ApplyEventListeners() {
    // Get the elements and convert them into an array
    // And loop through the array
    Array.from(document.querySelectorAll('.autocomplete-suggestion')).forEach(
        (element) => {
            // console.log(element);
            // Each suggestion can be clicked
            element.addEventListener('click', async function () {
                let address = element
                    .querySelector('.autocomplete-suggestion-address')
                    .innerHTML.trim();

                let lat = element.querySelector('input[name=latitude]').value;
                let lon = element.querySelector('input[name=longitude]').value;

                // Put the values in the saver
                document.querySelector('#input-lat').value = lat;
                document.querySelector('#input-long').value = lon;
                document.querySelector(
                    '#address-info-customer-address'
                ).innerHTML = address;

                // Hide suggestions
                document
                    .querySelector('.autocomplete-section')
                    .classList.add('hidden');

                // console.log('ADDRESS: ', address);
                // console.log('lat: ', lat);
                // console.log('lon: ', lon);
            });
        }
    );
}

// ==============================
// END OF LOCATION IQ RELATED JAVASCRIPT
// ==============================

async function BeginSearch() {
    // Get the textbox
    let searchbox = document.querySelector('#input-searchbox');
    await SearchPlace(searchbox);

    // Hide suggestinos
    document.querySelector('.autocomplete-section').classList.add('hidden');

    // Grab the first suggestion and put it in the customer address label
    let suggestionsArray = Array.from(
        document.querySelectorAll('.autocomplete-suggestion')
    );
    if (suggestionsArray.length > 0) {
        let element = suggestionsArray[0];
        let address = element
            .querySelector('.autocomplete-suggestion-address')
            .innerHTML.trim();
        let lat = element.querySelector('input[name=latitude]').value;
        let lon = element.querySelector('input[name=longitude]').value;

        // Put the values in the saver
        document.querySelector('#input-lat').value = lat;
        document.querySelector('#input-long').value = lon;
        document.querySelector('#address-info-customer-address').innerHTML =
            address;
    }
}

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
        let address = document.querySelector('#input-searchbox').value;
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
        let address = document.querySelector('#input-searchbox').value;

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
        let fetchResponse = await fetch('/save', {
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
