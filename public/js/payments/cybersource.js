window.onload = function () {
    ReloadTranslation();
};

document
    .querySelector('#btn-submit')
    .addEventListener('click', async function (e) {
        // Show Loading Screen
        LoadingView(true);
        let response = await ValidateCardDetails();
        if (
            !response.isValidCreditCardNumber ||
            !response.isValidCVV ||
            !response.isValidExpirationDate
        ) {
            // If invalid, alert user
            // Generate alert message
            console.log('Card is Invalid');
            LoadingView(false);
            DisplaySweetAlertError('Invalid credit card details.');
        } else {
            console.log('Card is Valid');
            let cardDetails = GetCardDetails();
            let finalCard = {
                cardNumber: cardDetails.cardnumber,
                securityCode: cardDetails.cardcvv,
                expirationMonth: cardDetails.cardexpmonth,
                expirationYear: cardDetails.cardexpyear,
                postalCode: cardDetails.cardpostal,
            };

            await SubmitPayment(finalCard);
        }
    });

async function ValidateCardDetails() {
    console.log('cybersource.ValidateCardDetails');
    let queryObject = GetQueryObject();
    let cardDetails = GetCardDetails();
    let data = {
        userProfile: queryObject,
        cardDetails: cardDetails,
    };

    let fetchResponse = await fetch('cybersource/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .catch((e) => {
            console.log('FETCH ERROR');
            console.log(e);
            DisplaySweetAlertError(e);
        });

    return ResponseHandler(fetchResponse);
}

async function SubmitPayment(token) {
    console.log('cybersource.SubmitPayment');
    let queryObject = GetQueryObject();

    let data = {
        userProfile: queryObject,
        paymentData: token,
    };

    let fetchResponse = await fetch('cybersource/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((response) => {
            CloseWebview(response.isFacebook);
        })
        .catch((e) => {
            let error = e.json();
            console.log('');
            console.log('Payment Error');
            DisplaySweetAlertError(error);
        });
}

function ResponseHandler(response) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            return SuccessHandler(data);
            break;
        case 'error':
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}

function SuccessHandler(data) {
    let { type } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isWebhook);
            break;
        case 'card-validation':
            return data;
            break;
        case 'payment-failed':
            DisplaySweetAlertInfo(data.message);
            CloseWebview(data.isWebhook);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}
