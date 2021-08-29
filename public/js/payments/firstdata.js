window.onload = function () {
    ReloadTranslation();
};

// Fires whenever there is a change in the iFrame
window.addEventListener('message', iFrameValidation, {
    capture: true,
    // once: true,
});

function iFrameValidation(event) {
    let jsonObject = JSON.parse(event.data);

    // Card was completely validated by firstdata
    if (jsonObject.errorCode === '0') {
        // Transfer to the hidden elements
        document.querySelector('#mytoken').value = jsonObject.token;
    } else {
        // Disable Submit Payment Button
        console.log(jsonObject);
        document.querySelector('#mytoken').value = '';
        // DisplaySweetAlertError(jsonObject.errorMessage);
    }
}

document
    .querySelector('#btn-submit')
    .addEventListener('click', async function () {
        LoadingView(true);
        let isBlankFlag = CheckIfNotBlank();
        if (isBlankFlag) {
            LoadingView(false);
            let text = document.querySelector('#sweet-text_BlankFields')
                .innerHTML;
            DisplaySweetAlertError(text);
        } else {
            let cardDetails = GetCardDetails();

            let data = {
                cardDetails: cardDetails,
            };
            console.log(data);

            // Validate CVV and Expiry
            // firstdata/validate

            let fetchResponse = await fetch('firstdata/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .catch((e) => {
                    console.log('');
                    console.log('FETCH ERROR');
                    console.log(e);

                    // Payment was declined
                    DisplaySweetAlertError(e.message);
                });

            let isValid = ResponseHandler(fetchResponse);
            if (isValid) {
                // CVC and Expiration is valid
                // Submit to the backend
                await SubmitPayment();
                LoadingView(false);
            } else {
                LoadingView(false);
                DisplaySweetAlertInfo(
                    'Credit Card details are invalid! Please make sure they are correct'
                );
            }
        }
    });

function CheckIfNotBlank() {
    let cardexpyear = document.querySelector('#card-exp-year').value.trim();
    let cardcvv = document.querySelector('#card-cvv').value.trim();
    let cardZip = document.querySelector('#card-zip').value.trim();

    if (cardexpyear === '' || cardcvv === '' || cardZip === '') {
        return true;
    } else {
        return false;
    }
}

// Get the Expiration and CVV
function GetCardDetails() {
    let cardexpmonth = document.querySelector('#card-exp-month').value.trim();
    let cardexpyear = document.querySelector('#card-exp-year').value.trim();
    let cardcvv = document.querySelector('#card-cvv').value.trim();
    let cardAddress = document.querySelector('#card-address').value.trim();
    let cardZip = document.querySelector('#card-zip').value.trim();

    let cardDetails = {
        cardnumber: 'EMPTY',
        cardexpmonth: cardexpmonth,
        cardexpyear: cardexpyear,
        cardcvv: cardcvv,
        cardAddress: cardAddress,
        cardZip: cardZip,
    };
    return cardDetails;
}

// Check if the CVC and Expiration are valid
function CheckValidation(data) {
    console.log('CheckValidation');
    console.log(data);
    let { isValidExpirationDate } = data;
    let token = document.querySelector('#mytoken').value;
    console.log('TOKEN');
    console.log(token);
    let isTokenExists = false;
    if (token || token !== '') {
        isTokenExists = true;
    }
    if (isValidExpirationDate && isTokenExists) {
        console.log('IS VALID');
        return true;
    } else {
        console.log('ERROR');
        return false;
    }
}

function FormatMonth(month) {
    return month;
    // let mathMonth = parseInt(month);
    // if (mathMonth < 10) {
    //     mathMonth = mathMonth.toString();
    //     return '0' + mathMonth;
    // } else {
    //     return month;
    // }
}

async function SubmitPayment() {
    console.log('');
    console.log('firstdata.SubmitPayment.js');
    let queryObject = GetQueryObject();
    let cardDetails = GetCardDetails();

    // September 2020
    // paymentData: { token: '9418594164541111', expiry: '0920' },

    let month = FormatMonth(cardDetails.cardexpmonth);
    let finalExpiry = `${month}${cardDetails.cardexpyear.substring(2)}`;
    let paymentData = {
        token: document.querySelector('#mytoken').value,
        expiry: finalExpiry,
        cvv: cardDetails.cardcvv,
        address: cardDetails.cardAddress,
        zip: cardDetails.cardZip,
    };

    let data = {
        queryObject,
        paymentData,
    };

    let fetchResponse = await fetch('firstdata/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .catch((e) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(e);
            DisplaySweetAlertError(e.message);
        });

    ResponseHandler(fetchResponse);
}

function ResponseHandler(response) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            return SuccessHandler(data);
            break;
        case 'error':
        case 'fail':
            DisplaySweetAlertError(message);
            return;
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            return;
            break;
    }
}

function SuccessHandler(data) {
    let { type } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'card-validation':
            let isValid = CheckValidation(data);
            return isValid;
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}
