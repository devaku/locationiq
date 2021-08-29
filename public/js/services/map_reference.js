// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

window.onload = function () {
    ReloadTranslation();
};

function initAutocomplete() {
    initializeMap();
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

    let position = {
        lat: Number(lat),
        lng: Number(long),
    };

    new google.maps.Marker({ position: position, map: map });
}

document
    .querySelector('#btn-submit')
    .addEventListener('click', async function () {
        // Get the coordinates
        let queryObj = GetQueryObject();
        let branch = document.querySelector('#input-branch').value;

        let data = {
            queryObj: queryObj,
            branch,
        };

        // Send the JSON to the backend
        let fetchResponse = await fetch('orderhere', {
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

function ResponseHandler(response) {
    let { status } = response;
    switch (status) {
        case 'success':
            let { isFacebook } = response.data;
            CloseWebview(isFacebook);
            break;
        case 'error':
            let { message } = response.data;
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled Response!');
            break;
    }
}
