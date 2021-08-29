// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// https://developers.google.com/maps/documentation/javascript/examples/places-searchbox

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

let markers = [];
let map;
let geocoder;
let input;
let searchBox;

window.onload = function () {
    // Generate the extra fields if needed
    GenerateAddressFields();
    ReloadTranslation();
};

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    input = document.querySelector('#pac-input');

    let lat = Number(document.querySelector('#input-lat-reference').value);
    let long = Number(document.querySelector('#input-long-reference').value);

    console.log('REFERENCE LATLONG');
    console.log('LAT: ', lat, 'LONG: ', long);

    let defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat, long)
    );

    searchBox = new google.maps.places.SearchBox(input, {
        bounds: defaultBounds,
    });

    map = initializeMap();

    const options = {
        fields: ['formatted_address', 'geometry', 'name'],
        origin: map.getCenter(),
        strictBounds: false,
    };

    // const autocomplete = new google.maps.places.Autocomplete(input, options);

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    // Fires when the user TYPES
    searchBox.addListener('places_changed', async function (event) {
        console.log('CLICK SEARCH BUTTON');
        // await SearchAutoComplete(autocomplete);
        await SearchPlace(searchBox);
    });
}

async function SearchAutoComplete(autocomplete) {
    console.log('\n Searching for places');
    const place = autocomplete.getPlace();

    // If the formatted address doesn't exist, then it shouldn't be used ????
    if (!place.formatted_address) {
        console.log('No location found!');
        let text = document.querySelector(
            '#sweet-text_LocationNotFound'
        ).innerHTML;
        DisplaySweetAlertInfo(text);
        return;
    }

    console.log(place);

    // Save the Long and Lat of the chosen destination
    let lat = document.querySelector('#input-lat');
    let long = document.querySelector('#input-long');

    lat.value = place.geometry.location.lat();
    long.value = place.geometry.location.lng();

    // Put marker address on searchbox
    document.getElementById('pac-input').value = place.name;

    // Put latitude and longitude into the label thing
    document.querySelector(
        '#address-info-latitude-longitude'
    ).innerHTML = `${lat.value}, ${long.value}`;

    // Put address into the text
    let address = place.name + ' ' + place.formatted_address;
    document.querySelector(
        '#address-info-customer-address'
    ).innerHTML = `${address}`;

    // Logs for reference
    console.log('Formatted Address:', place.formatted_address);
    console.log('Name: ', place.name);
    console.log('Coordinates: ');
    console.log('Latitude: ', place.geometry.location.lat());
    console.log('Longitude: ', place.geometry.location.lng());
}

async function SearchPlace(searchBox) {
    console.log('\n Searching for places');
    let places = searchBox.getPlaces();

    if (places.length == 0) {
        console.log('No location found!');
        let text = document.querySelector(
            '#sweet-text_LocationNotFound'
        ).innerHTML;
        DisplaySweetAlertInfo(text);
        return;
    }

    // Only get the FIRST location in the returned locations
    let place = places[0];
    if (!place.geometry) {
        console.log('Returned place contains no geometry');
        return;
    }

    let long = document.querySelector('#input-long');
    let lat = document.querySelector('#input-lat');

    // Save the Long and Lat of the chosen destination
    long.value = place.geometry.location.lng();
    lat.value = place.geometry.location.lat();

    // geocodeLatLng(geocoder, map, place.geometry.location, false);

    // Put marker address on searchbox
    document.getElementById('pac-input').value = place.name;

    console.log('Lat: ', lat.value);
    console.log('Long: ', long.value);

    document.querySelector(
        '#address-info-latitude-longitude'
    ).innerHTML = `${lat.value}, ${long.value}`;

    // address name/label + full address
    let address = place.name + ' - ' + place.formatted_address;

    document.querySelector(
        '#address-info-customer-address'
    ).innerHTML = `${address}`;
}

// LAT  14.3431979
// LONG 120.9309776

async function Debug_SouthPlains() {
    // Add marker
    let location = {
        lat: 14.3431979,
        lng: 120.9309776,
        name: 'South Plains Dasmarinas',
    };
    console.log('\n Clearing out old markers');
    // Clear out the old markers.
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    markers = [];
    await addMarker(location, map, geocoder, false);

    // Put the text into the search box
    document.getElementById('pac-input').value = location.name;
}

function geocodeLatLng(geocoder, map, pos, isClicked) {
    geocoder.geocode({ location: pos }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                if (isClicked) {
                    console.log('IS CLICKED');
                    document.getElementById('pac-input').value =
                        results[0].formatted_address;
                } else {
                }
            } else {
                window.alert('No results found');
            }
        } else {
            console.error('Geocoder failed due to: ' + status);
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function initializeMap() {
    let lat = document.querySelector('#input-lat-reference').value;
    let long = document.querySelector('#input-long-reference').value;

    let map = new google.maps.Map(document.querySelector('#map'), {
        center: { lat: Number(lat), lng: Number(long) },
        zoom: 11,
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
        },
        scaleControl: true,
        streetViewControl: false,
        fullscreenControl: false,
    });
    return map;
}

// ==============================
// END OF GOOGLE MAPS RELATED JAVASCRIPT
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

function ClearSearch() {
    document.querySelector('#pac-input').value = '';
}

function BeginSearch() {
    let input = document.getElementById('pac-input');
    google.maps.event.trigger(input, 'focus', {});
    google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
    google.maps.event.trigger(this, 'focus', {});
}

// ==============================
// EXTRA ADDRESS FIELDS RELATED
// ==============================

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
