window.onload = async function () {
    // Retrieve the EJS variables
    let context = document.querySelector('#ejs-var-context').value;
    let SERVER_WEB_URL = document.querySelector('#ejs-var-serverweburl').value;
    let paymentSession = document.querySelector('#ejs-var-paymentsession')
        .value;
    // Create a config object for SDK.
    let sdkConfigObj = {
        context: context,
    };
    // Initiate the Checkout form.
    let checkout = chckt.checkout(
        paymentSession,
        '#your-payment-div',
        sdkConfigObj
    );
    chckt.hooks.beforeComplete = async function (node, paymentData) {
        // 'node' is a reference to the Checkout container HTML node.
        // 'paymentData' is the result of the payment, and contains the 'payload'.
        if (paymentData.resultCode.toLowerCase() === 'authorised') {
            let queryObject = GetQueryObject();
            let data = {
                payload: paymentData.payload,
                queryObject,
            };
            let fetchResponse = await fetch('adyen/parse', {
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
                });
            console.log(fetchResponse);
            if (fetchResponse.status === 'success') {
                let url = `${SERVER_WEB_URL}/payments/adyen/landing?status=success`;
                window.location.href = url;
            } else {
                let url = `${SERVER_WEB_URL}/payments/adyen/landing?status=failed`;
                window.location.href = url;
            }
        } else {
            console.log('PAYMENT WAS NOT AUTHORIZED');
            console.log(paymentData.resultCode);
            let message = `Payment was not authorized: ${paymentData.resultCode}`;
            DisplaySweetAlertError(message);
        }
        return false; // Indicates that you want to replace the default handling.
    };
};
