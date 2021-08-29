window.onload = function () {
    let stripeKey = document.querySelector('#ejs-var-stripe-key').value;
    let stripeMerchantID = document.querySelector('#ejs-var-stripe-account')
        .value;

    DeleteEJSVariables();

    // Setup Card
    let stripeObj = SetupElements(stripeKey, stripeMerchantID);
    document.querySelector('#btn-submit').disabled = false;

    CheckCardErrors([stripeObj.card]);

    // Listener for the textbox inputs
    // Move the inputs up if they have focus
    InputFocusListener();

    // Listener for Form
    let submitPayment = document.getElementById('btn-submit');
    submitPayment.addEventListener('click', async function (event) {
        try {
            LoadingView(true);

            // Check the email first
            // At least validate email first here
            let inputForm = GetUserInputFromForm();
            let isValidEmail = CheckValidEmail(inputForm.inputEmail);
            if (!isValidEmail) {
                LoadingView(false);
                let text = document.querySelector('#sweet-text_InvalidEmail')
                    .innerHTML;
                DisplaySweetAlertError(text);
                return;
            } else {
                // Create the PaymentMethod
                let paymentMethodID = await CreatePaymentMethod(
                    stripeObj.stripe,
                    stripeObj.card
                );

                if (!paymentMethodID) {
                    LoadingView(false);
                    let text = document.querySelector('#sweet-text_InvalidCard')
                        .innerHTML;
                    DisplaySweetAlertError(text);
                    return;
                } else {
                    // If valid, submit details
                    let fetchResponse = await CreatePaymentIntent(
                        inputForm.inputEmail,
                        paymentMethodID
                    );

                    await ResponseHandler(fetchResponse, stripeObj.stripe);
                }
            }
        } catch (e) {
            LoadingView(false);
            console.log('');
            console.log('submitPayment EVENT LISTENER ERROR');
            console.log(e);
            DisplaySweetAlertError(e);
        }
    });
    ReloadTranslation();
};

async function ResponseHandler(response, stripe) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            await SuccessHandler(data, stripe);
            break;
        case 'error':
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}

async function SuccessHandler(data, stripe) {
    let { type } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'payment-intent':
            SubmitCard(stripe, data);
            break;
        default:
            DisplaySweetAlertError('Unhandled success response!');
            break;
    }
}

// ===============
// STRIPE SETUP RELATED
// ===============

function DeleteEJSVariables() {
    document.querySelector('#ejs-var-stripe-key').remove();
    document.querySelector('#ejs-var-stripe-account').remove();
}

/*
 * Checks if the device accessing is a mobile device or not
 * */
function MobileCheck() {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

// This function is mainly here to MOVE the input up because
// The keyboard blocks it.
function InputFocusListener() {
    console.log('InputFocusListener');
    // Get the form
    let paymentForm = document.querySelector('#payment-form');

    // Get the inputs from the form
    let inputs = [paymentForm.querySelector('input[type=email]')];

    //This only applies to mobile device
    let viewPortWidth = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
    );
    let viewPortHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
    );

    // console.log(inputs);
    console.log('Mobile Check: ', MobileCheck());
    console.log(viewPortWidth);
    if (MobileCheck() && (viewPortWidth < 320 || viewPortHeight < 500)) {
        //Attach Listeners
        for (let index = 0; index < inputs.length; ++index) {
            let currentInput = inputs[index];
            console.log(currentInput);
            let parentContainer = currentInput.parentElement;
            currentInput.addEventListener('focus', function () {
                parentContainer.classList.add('input-focused');
                paymentForm.classList.add('push-down');
            });
            currentInput.addEventListener('focusout', function () {
                parentContainer.classList.remove('input-focused');
                paymentForm.classList.remove('push-down');
            });
            currentInput.addEventListener('keyup', function (e) {
                if (e.which === 13) {
                    currentInput.blur();
                }
            });
        }
    }
}

/*
 * Sets up the card form to be displayed on screen
 * */
function SetupElements(stripeKey, stripeMerchantID) {
    console.log('');
    console.log('stripepage.SetupElements');
    const stripe = Stripe(stripeKey, {
        stripeAccount: stripeMerchantID,
    });

    /*
     * Set up Stripe Elements to use in checkout form
     * */
    let elements = stripe.elements({
        fonts: [
            {
                cssSrc: 'https://fonts.googleapis.com/css?family=Quicksand',
            },
        ],
        // Stripe's examples are localized to specific languages, but if
        // you wish to have Elements automatically detect your user's locale,
        // use `locale: 'auto'` instead.
    });

    let elementStyles = {
        base: {
            'padding': '100px',
            'color': '#424770',
            'fontWeight': 600,
            'fontFamily': '"Helvetica Neue", Helvetica, sans-serif',
            'fontSize': '16px',
            'fontSmoothing': 'antialiased',

            ':focus': {
                color: '#000',
            },

            '::placeholder': {
                color: '#9BACC8',
            },

            ':focus::placeholder': {
                color: '#CFD7DF',
            },
        },
        invalid: {
            'color': '#ff000a',
            ':focus': {
                color: '#ff000a',
            },
            '::placeholder': {
                color: '#ff000a',
            },
        },
    };

    let elementClasses = {
        focus: 'focus',
        empty: 'empty',
        invalid: 'invalid',
    };

    let card = elements.create('card', {
        style: elementStyles,
        classes: elementClasses,
    });
    card.mount('#card-details');

    return {
        stripe: stripe,
        card: card,
    };
}

function CheckCardErrors(elements) {
    // Listen for errors from each Element, and show error messages in the UI.
    elements.forEach(function (element, idx) {
        element.on('change', function (event) {
            if (event.error) {
                console.log('Error on Card');
                console.log('Card Error: ', event.error.message);
            }
        });
    });
}

// ===============
// PAYMENT RELATED
// ===============

/*
 * Creates a payment method to be attached to the payment intent
 * */
async function CreatePaymentMethod(stripe, card) {
    try {
        let response = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });
        let finalResponse;
        if (response.paymentMethod) {
            //Payment Method was successful
            finalResponse = response.paymentMethod.id;
        } else {
            //Payment Method wasn't successful
            console.log('There was an error in creating the payment method.');
        }
        return finalResponse;
    } catch (e) {
        LoadingView(false);
        console.log('');
        console.log('CreatePaymentMethod ERROR');
        console.log(e);
    }
}

/*
 * Creates a payment intent based on the cart details the user has.
 * Returns a ClientSecret that points to the created payment intent
 * */
async function CreatePaymentIntent(email, paymentMethodID) {
    let queryObject = GetQueryObject();
    let data = {
        userProfile: queryObject,
        email: email,
        paymentMethodID: paymentMethodID,
    };
    // POST the information to the backend for processing
    let fetchResponse = await fetch('stripe/createpaymentintent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((data) => data.json())
        .catch((e) => {
            LoadingView(false);
            console.log('');
            console.log('stripepage.CreatePaymentIntent ERROR');
            console.log(e);
            return e;
        });

    return fetchResponse;
}

async function SubmitCard(stripe, data) {
    try {
        let clientSecret = data.clientSecret;
        // let intentId = data.intentId;
        console.log('\nstripepage.SubmitCard');
        // Initiate the payment.
        // If authentication is required, confirmCardPayment will automatically display a modal
        let result = await stripe.confirmCardPayment(clientSecret);
        console.log('CONFIRM PAYMENT SECTION');

        // Display the error if there is one and break the chain
        if (result.error) {
            console.log('Error in processing card');
            console.log(JSON.stringify(result));
            PaymentErrorHandling(result.error);
            return;
        }

        console.log('\nPAYMENT SUCCESS!');

        // This is for saving the payment info to the CustomerObject
        // Currently UNUSED for now
        // let paymentMethod = result.paymentIntent.payment_method;

        // The clientSecret of the NEW paymentIntent
        let newClientSecret = result.paymentIntent.client_secret;

        // Set the overly engineered timer
        // await StartServerSideTimer(result.paymentIntent.id);

        let paymentIntent = await stripe.retrievePaymentIntent(newClientSecret);
        console.log('Retrieved Payment Intent:');
        // console.log(JSON.stringify(paymentIntent));
        await OrderComplete(paymentIntent.paymentIntent);
    } catch (e) {
        LoadingView(false);
        console.log('\nstripepage.SubmitCard ERROR');
        console.error(e);
    }
}

async function StartServerSideTimer(clientSecret) {
    try {
        console.log('StartServerSideTimer');
        let queryObject = GetQueryObject();
        let data = {
            userProfile: queryObject,
            clientSecret,
        };
        await fetch('stripe/statuschecker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((result) => result.json())
            .catch((e) => {
                console.log('\nstripepage.StartServerSideTimer ERROR');
                console.log(e);
                return e;
            });
    } catch (e) {
        console.log('StartServerSideTimer ERROR');
        console.error(e);
    }
}

async function RetrievePaymentIntentTimer() {
    console.log('Running Retrieve PaymentIntent Timer');
}

function PaymentErrorHandling(errorDetails) {
    console.log('\nPaymentErrorHandling');
    let message = '';
    let text = '';
    switch (errorDetails.decline_code) {
        case 'insufficient_funds':
            // Stop loading to try again
            LoadingView(false);
            text = document.querySelector('#sweet-text_NotEnoughBalance')
                .innerHTML;
            DisplaySweetAlertError(text);
            break;
        case 'authentication_required':
            LoadingView(false);
            text = document.querySelector('#sweet-text_AuthenticationRequired')
                .innerHTML;
            DisplaySweetAlertInfo(text);
            break;

        case 'payment_intent_authentication_failure':
            // User failed in authenticating with their bank
            // Stop loading to try again
            LoadingView(false);
            text = document.querySelector('#sweet-text_PaymentUnsuccessful')
                .innerHTML;
            DisplaySweetAlertError(text);
            break;
        case 'card_declined':
            LoadingView(false);
            // ChangeLoadingState(false);
            text = document.querySelector('#sweet-text_PaymentUnsuccessful')
                .innerHTML;
            DisplaySweetAlertError(text);
            break;
        case 'email_invalid':
        default:
            message = `Error: ${errorDetails.message}`;
            DisplaySweetAlertError(message);
            LoadingView(false);
            break;
    }
}

/*
 * LAST FUNCTION to be called
 * Is called upon order processing completion
 * and closes the page as well
 * */
async function OrderComplete(paymentIntent) {
    let queryObject = GetQueryObject();
    let data = {
        userProfile: queryObject,
        paymentIntent: paymentIntent,
    };
    let fetchResponse = await fetch('stripe/ordercomplete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((result) => result.json())
        .catch((e) => {
            console.log('');
            console.log('stripepage.OrderComplete ERROR');
            console.log(e);
            return e;
        });

    await ResponseHandler(fetchResponse);
}

/*
 * Gets the name and email fields
 * */
function GetUserInputFromForm() {
    let formEmail = document.querySelector('#txtboxemail');
    return {
        inputEmail: formEmail.value.trim(),
    };
}

function CheckValidEmail(email) {
    const emailregex = new RegExp(
        '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
    );
    return emailregex.test(email);
}
