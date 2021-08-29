let timerIntervalID;

window.onload = function () {
    let buttons = document.querySelectorAll('.btnSubmitPaymentSelection');
    buttons = Array.from(buttons);
    buttons.forEach((currentButton) => {
        currentButton.addEventListener('click', async function (e) {
            // console.log('TEST');
            LoadingView(true);

            let el = e.srcElement;
            // Go up the tree
            el = el.parentNode;

            let alttext = el.querySelector('img[alt]').getAttribute('alt');
            alttext = alttext.trim();

            let imagesrc = el.querySelector('img').getAttribute('src');
            imagesrc = imagesrc.trim();

            // Get payment selection
            let paymentSelection = el.querySelector(
                'input[name="payment-channel"]'
            ).value;
            paymentSelection = paymentSelection.trim();

            // Get payment type
            // If QR / WebPay
            let paymentType = el.querySelector('input[name="payment-type"]')
                .value;
            paymentSelection = paymentSelection.trim();

            let isMobile = MobileCheck();

            let queryObject = GetQueryObject();
            let data = {
                queryObject,
                paymentSelection,
                paymentType,
                alttext,
                imagesrc,
                isMobile,
            };

            // console.log(data);

            let fetchResponse = await fetch('aub/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .catch((e) => {
                    let error = e;
                    DisplaySweetAlertError(error);
                });
            LoadingView(false);
            ResponseHandler(fetchResponse);
        });
    });
    ReloadTranslation();
};

function ResponseHandler(response) {
    let { status, data } = response;
    switch (status) {
        case 'success':
            SuccessHandler(data);
            break;
        case 'error':
            let message = data.message;
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
            clearInterval(data.timerID);
            // CloseWebview(data.isWebhook);
            CloseWebview(data.isFacebook);
            break;
        case 'textinformation':
            DisplayTextInformation({
                textInformation: data.textInformation,
                paymentSelection: data.paymentSelection,
                paymentImage: data.imagesrc,
                paymentText: data.alttext,
            });
            break;
        case 'qr':
            DisplayQR({
                qrImage: data.imageLink,
                paymentImage: data.imagesrc,
                paymentText: data.alttext,
                paymentSelection: data.paymentSelection,
            });
            break;
        case 'redirect':
            let webLink = data.webLink;
            window.location.href = webLink;
            break;

        case 'empty':
            console.log('Transaction still in progress');
            break;

        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}

async function StatusChecker({
    paymentSelection,
    invoiceID = 000,
    isAPI,
    orderID,
}) {
    try {
        let queryObject = GetQueryObject();
        let data = {
            queryObject,
            service: paymentSelection,
            originalorderid: orderID,
            invoiceID,
        };

        let url = '';
        if (isAPI) {
            url = 'aub/status';
        } else {
            url = 'aub/dbStatus';
        }

        let fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .catch((e) => {
                let error = e;
                clearInterval(timerIntervalID);
                throw e;
                // DisplaySweetAlertError(error);
            });
        fetchResponse.data.timerID = timerIntervalID;
        ResponseHandler(fetchResponse);
    } catch (e) {
        console.log('\n StatusChecker ERROR');
        console.error(e);
        throw e;
    }
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

/**
 * ===========
 * DISPLAYERS
 * ===========
 */

function DisplayTextInformation({
    textInformation,
    paymentImage,
    paymentText,
    paymentSelection,
}) {
    // Hide the payment view
    document.querySelector('#select-payment-view').classList.add('hidden');
    document.querySelector('#information-title-text').classList.add('hidden');

    // Display the Text Information View
    document.querySelector('#selected-channel-text').innerHTML = paymentText;
    document.querySelector('#selected-channel-img').src = paymentImage;
    document.querySelector('#selected-channel-img').alt = paymentText;

    document.querySelector('#text-information-invoiceid').innerHTML =
        textInformation.invoice_id;

    // Format the expiration date
    let currentExpirationDate = textInformation.expiration_date;
    let year = currentExpirationDate.substring(0, 4);
    let month = currentExpirationDate.substring(4, 6);
    let date = currentExpirationDate.substring(6, 8);
    let hours = currentExpirationDate.substring(8, 10);
    let minutes = currentExpirationDate.substring(10, 12);
    let second = currentExpirationDate.substring(12, 14);
    let finalFormattedDate = `
    ${year}/${month}/${date} ${hours}:${minutes}:${second}
    `;

    document.querySelector(
        '#text-information-expirationdate'
    ).innerHTML = finalFormattedDate;
    document.querySelector('#text-information-view').classList.remove('hidden');

    // STATUS CHECKER
    // 1000 = 1 second
    // 60000 = 1 minute
    let timerMinutes = 1 * 5000;

    let orderID = document.querySelector('#ejs-var-orderID').value;

    // 1 minutes
    timeIntervalID = setInterval(async () => {
        try {
            await StatusChecker({
                isAPI: true,
                invoiceID: textInformation.invoice_id,
                orderID,
                paymentSelection,
            });
        } catch (e) {
            clearInterval(timerIntervalID);
        }
    }, timerMinutes);
    timerIntervalID;
}

function DisplayQR({ qrImage, paymentImage, paymentText, paymentSelection }) {
    // Hide the payment view
    document.querySelector('#select-payment-view').classList.add('hidden');
    document.querySelector('#information-title-text').classList.add('hidden');

    // Display the QR View
    document.querySelector('#selected-qr-channel-text').innerHTML = paymentText;
    document.querySelector('#selected-qr-channel-img').src = paymentImage;
    document.querySelector('#selected-qr-channel-img').alt = paymentText;
    document.querySelector('#qrcode_img').src = qrImage;
    document.querySelector('#qr-payment-view').classList.remove('hidden');

    let orderID = document.querySelector('#ejs-var-orderID').value;

    // STATUS CHECKER
    // 1000 = 1 second
    // 60000 = 1 minute
    let minutes = 1 * 5000;

    // 1 minutes
    timeIntervalID = setInterval(async () => {
        try {
            await StatusChecker({ isAPI: true, orderID, paymentSelection });
        } catch (e) {
            clearInterval(timerIntervalID);
        }
    }, minutes);
    timeIntervalID;
}
