window.onload = async function () {
    // Retrieve the EJS variables
    let context = document.querySelector('#ejs-var-context').value;
    let paymentMethod = JSON.parse(
        document.querySelector('#ejs-var-paymentmethod').value
    );
    let originkey = document.querySelector('#ejs-var-originkey').value;

    // Adyen configuration
    let sdkConfigObj = {
        environment: context,
        hasHolderName: false,
        originKey: originkey,
        paymentMethodsResponse: paymentMethod,
        removePaymentMethods: ['paysafecard', 'c_cash'],
    };

    // 1. Create an instance of AdyenCheckout
    const checkout = new AdyenCheckout(sdkConfigObj);

    // 2. Create and mount the Component
    const dropin = checkout
        .create('dropin', {
            // Events
            onSelect: (activeComponent) => {
                //updateStateContainer(activeComponent.data);
            },
            onChange: (state) => {
                //updateStateContainer(state);
            },
            onSubmit: (state, component) => {
                // state.data;
                // state.isValid;
                MakePayment(state.data, component);
            },
            onAdditionalDetails: (state, component) => {
                MakeRedirect(state.data, component);
            },
            paymentMethodsConfiguration: {
                card: {
                    // Example optional configuration for Cards
                    hasHolderName: false,
                    holderNameRequired: false,
                    enableStoreDetails: false,
                    hideCVC: false, // Change this to true to hide the CVC field for stored cards
                    name: 'Credit or debit card',
                    amount: {},
                },
            },
        })
        .mount('#dropin-container');

    ReloadTranslation();
};

async function MakeRedirect(paymentMethod, component) {
    // Posts a redirect to 3DS/Banks into the local server
    let queryObject = GetQueryObject();
    let values = {
        queryObject,
        details: paymentMethod.details,
        paymentData: paymentMethod.paymentData,
    };

    let baseUrl =
        window.location.origin + '/web/payments/adyen/additionalpayment';
    let fetchResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(error);
        });

    ResponseHandler(fetchResponse, component);
}

async function MakePayment(paymentMethod, component) {
    // POST the payment to backend
    let queryObject = GetQueryObject();
    let values = {
        queryObject,
        paymentMethod,
    };

    let baseUrl = window.location.origin + '/web/payments/adyen/payment';
    let fetchResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(error);
        });

    ResponseHandler(fetchResponse, component);
}

function AdyenHandler(res, dropin) {
    // console.log(JSON.stringify(res));
    if (res.action) {
        console.log('IS AN ACTION');
        dropin.handleAction(res.action);
    } else {
        console.log('NO ACTION');
        console.log(res);
    }
}

function ResponseHandler(response, component) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            return SuccessHandler(data, component);
            break;
        case 'error':
            DisplaySweetAlertError(message);
            return;
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            return;
            break;
    }
}

function SuccessHandler(data, component) {
    let { type } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'payment-action':
            AdyenHandler(data, component);
            break;
        case 'redirect':
            window.location.origin = data.url;
            return;
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}
