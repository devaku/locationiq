window.onload = async function () {
    //Initialize Webpage
    await SetupPage();
    ReloadTranslation();
};

/*
 * Initalize the Card Form
 * */
async function SetupPage() {
    let applicationid = document.querySelector('#ejs-var-square-application-id')
        .value;

    const paymentForm = new SqPaymentForm({
        // Initialize the payment form elements
        applicationId: applicationid,
        inputClass: 'sq-input',
        autoBuild: false,
        // Customize the CSS for SqPaymentForm iframe elements
        inputStyles: [
            {
                fontSize: '16px',
                lineHeight: '24px',
                padding: '16px',
                placeholderColor: '#a0a0a0',
                backgroundColor: 'transparent',
            },
        ],
        // Initialize the credit card placeholders
        cardNumber: {
            elementId: 'sq-card-number',
            placeholder: 'Card Number',
        },
        cvv: {
            elementId: 'sq-cvv',
            placeholder: 'CVV',
        },
        expirationDate: {
            elementId: 'sq-expiration-date',
            placeholder: 'MM/YY',
        },
        postalCode: {
            elementId: 'sq-postal-code',
            placeholder: 'Postal',
        },
        // SqPaymentForm callback functions
        callbacks: {
            /*
             * callback function: cardNonceResponseReceived
             * Triggered when: SqPaymentForm completes a card nonce request
             */
            cardNonceResponseReceived: async function (
                errors,
                nonce,
                cardData
            ) {
                console.log('');
                console.log('cardNonceResponseReceived');
                if (errors) {
                    console.log('Encountered Errors:');
                    errors.forEach(function (error) {
                        console.log(error.message, false);
                    });

                    let text = document.querySelector('#sweet-text_InvalidCard')
                        .innerHTML;
                    DisplaySweetAlertError(text);

                    LoadingView(false);

                    //Reenable button
                    // document.querySelector('#sq-creditcard').disabled = false;
                    return;
                } else {
                    console.log('TOKENIZATION SUCCESSFUL. Submitting Payment');
                    await SubmitPayment(nonce);
                }
            },
        },
    });
    paymentForm.build();

    let payButton = document.querySelector('#btn-submit');
    payButton.addEventListener('click', function (event) {
        console.log('PROCESSING PAYMENT');
        // Don't submit the form until SqPaymentForm returns with a nonce
        event.preventDefault();
        // Request a nonce from the SqPaymentForm object
        paymentForm.requestCardNonce();

        // Disable button
        LoadingView(true);
    });
}

async function SubmitPayment(token) {
    console.log('squarepage.SubmitPayment');
    let queryObject = GetQueryObject();

    let data = {
        userProfile: queryObject,
        token: token,
    };

    let fetchResponse = await fetch('square/submit', {
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

    ResponseHandler(fetchResponse);
}

function ResponseHandler(response) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            CloseWebview(data.isFacebook);
            break;
        case 'fail':
            LoadingView(false);
            DisplaySweetAlertError(data.result);
            break;
        case 'error':
            LoadingView(false);
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}
