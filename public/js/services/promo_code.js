window.onload = function () {
    ReloadTranslation();
};

// =================
// PROMO CODE
// =================

function Submit() {
    LoadingView(true);
    let promo_code = document.querySelector('#input-otp').value.trim();
    let queryObj = GetQueryObject();

    let data = {
        queryObj,
        promo_code,
    };

    console.log(data);

    //Send the JSON to the backend
    fetch('promo/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
        });
}

function Cancel() {
    LoadingView(true);
    let queryObj = GetQueryObject();

    let data = {
        queryObj,
    };

    console.log(data);

    //Send the JSON to the backend
    fetch('promo/cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
        });
}

function ResponseHandler(response) {
    let { status, data, message } = response;
    let display = '';
    switch (status) {
        case 'success':
            LoadingView(false);
            SuccessHandler(data);
            break;
        case 'fail':
        case 'error':
            LoadingView(false);
            DisplaySweetAlertError(message);
            break;
        default:
            display = `Unhandled Response!`;
            LoadingView(false);
            DisplaySweetAlertError(display);
            break;
    }
}

function SuccessHandler(data) {
    let { type } = data;
    switch (type) {
        case 'mismatch':
            DisplaySweetAlertInfo(data.message);
            break;
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'redirect':
            console.log('REDIRECTING');
            window.location.href = data.url;
            break;
        default:
            let display = `Unhandled Response!`;
            DisplaySweetAlertError(display);
            break;
    }
}
