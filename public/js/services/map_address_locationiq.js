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
        // ReloadTranslation();
        await LoadMap();
    } catch (e) {}
};

/**
 * Location IQ Related
 */

let map;

// Draws/Redraws the map on screen
// Redrawing is needed to move the viewport to the pin
async function DrawMap(coordinates) {
    // Get the API key
    let locationiqKey = document
        .querySelector('#location-iq-apikey')
        .innerHTML.trim();
    let { lat, lng } = coordinates;

    // Define the map and configure the map's theme
    map = new mapboxgl.Map({
        container: 'map-section',

        //need this to show a compact attribution icon (i) instead of the whole text
        attributionControl: false,
        style:
            'https://tiles.locationiq.com/v3/streets/vector.json?key=' +
            locationiqKey,
        zoom: 15,
        center: [lng, lat],
    });
    map.on('click', DropPin);
}

async function LoadMap() {
    let lat = document.querySelector('#ejs-var-lat').value;
    let lng = document.querySelector('#ejs-var-lng').value;

    let coordinates = {
        lat,
        lng,
    };

    await DrawMap(coordinates);
}

// Waltermart
// LNG:  120.94131616372067
// LAT:  14.325162474263166

// Accepts either an event from the click
// Or just an object { lng, lat }
async function DropPin(e) {
    // console.log(e);
    let coordinates;
    if (e.lngLat) {
        coordinates = e.lngLat.wrap();
    } else {
        coordinates = e;
    }
    // console.log(coordinates);

    // console.log('LNG: ', coordinates.lng);
    // console.log('LAT: ', coordinates.lat);

    // Draw marker on map
    await DrawMarkerOnMap(coordinates);

    // Get information about coordinates given
    await ReverseGeocode(coordinates);
}

// Element used for drawing the pin
let divMarker = document.createElement('div');
divMarker.className = 'marker';
divMarker.style.backgroundImage = 'url(/assets/marker50px.png)';

// Draws marker on map based on coordinates
// Accepts an object { lng, lat }
async function DrawMarkerOnMap(e) {
    let coordinates = [e.lng, e.lat];

    // console.log(coordinates);
    let marker = new mapboxgl.Marker(divMarker)
        .setLngLat(coordinates)
        .addTo(map);
}

async function ReverseGeocode(coordinates) {
    let { lng, lat } = coordinates;

    let queryObject = GetQueryObject();
    let apikey = document.querySelector('#location-iq-apikey').innerHTML.trim();
    let data = {
        queryObject,
        apikey,
        lng,
        lat,
    };

    // console.log('GEOCODING');
    // Get details from backend
    let response = await fetch('/geocode', {
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

    // console.log(response);
    if (response.status === 'success' && response.data.info) {
        let { lat: latitude, lng: longitude, address } = response.data.info;

        // Put the values in the saver
        document.querySelector('#input-lat').setAttribute('value', latitude);
        document.querySelector('#input-long').setAttribute('value', longitude);
        document.querySelector('#address-info-customer-address').innerHTML =
            address;
    }
}

// Gets information based on the given text input
// Accetps a string or a HTML element with a value attribute
async function SearchPlace(e) {
    let inputText;
    if (e.value) {
        inputText = e.value.trim();
    } else {
        inputText = e.trim();
    }

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

        // console.log(response);
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

                // Draw suggestion on map
                let coordinates = {
                    lat,
                    lng: lon,
                };

                // Redraw map
                await DrawMap(coordinates);

                // Put the pin on the map
                await DropPin(coordinates);
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

function CheckIfLngLatInput() {
    // Get the coordinates
    let long = document.querySelector('#input-long').value;
    let lat = document.querySelector('#input-lat').value;

    if (!long && !lat) {
        let text = document.querySelector(
            '#sweet-text_CustomerAddressCannotBeBlank'
        ).innerHTML;
        DisplaySweetAlertInfo(text);
        return false;
    } else {
        return true;
    }
}

document
    .querySelector('#btn-pin-submission-submit')
    .addEventListener('click', async function () {
        // if (!CheckIfLngLatInput()) {
        //     return;
        // }
        // Display modal
        $('#modalpindropsubmission').modal({
            keyboard: false,
            focus: true,
        });

        return;
    });

document
    .querySelector('#btn-final-submit')
    .addEventListener('click', async function () {
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
    .querySelector('#btn-modal-addressinfo-no')
    .addEventListener('click', async function (e) {
        Swal.fire(
            'Please make sure address information is correct!',
            '',
            'info'
        );
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
