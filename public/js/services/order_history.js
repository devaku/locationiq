window.onload = function () {
    // console.log('ONLOAD');
    // Get the EJS injected variable
    let receiptJson = document.querySelector('#ejs-receipt-json').innerHTML;
    receiptJson = JSON.parse(receiptJson);

    // Generate the Bottom Footer for the Page
    let html = GenerateBottomFooter(receiptJson);
    console.log(html);

    // Replace the placeholder tag
    document
        .querySelector('#ejs-receipt-bottom-footer')
        .insertAdjacentHTML('afterend', html);

    // Remove marker
    let element = document.querySelector('#ejs-receipt-bottom-footer');
    element.parentNode.removeChild(element);

    ReloadTranslation();
};

// window.addEventListener('load', (event) => {
//     console.log('TRANSLATING');
// });

document.querySelectorAll('.button-container').forEach((el) => {
    el.addEventListener('click', async function (e) {
        let sessionid = el.querySelector('input[type=hidden]').value;
        let command = e.target.value;
        if (command.toLowerCase() === 'view') {
            await ViewReceipt(sessionid);
        } else {
            await OrderCommand(sessionid);
        }
    });
});

async function ViewReceipt(sessionid) {
    let data = {
        sessionid: sessionid,
    };

    let response = await fetch('history/view', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((res) => res.json());
    ResponseHandler(response);
}

function ResponseHandler(response) {
    let { status } = response;
    switch (status) {
        case 'success':
            let { data } = response;
            if (data.type === 'close') {
                let { isFacebook } = data;
                CloseWebview(isFacebook);
            } else {
                let { jsonObject } = data;
                GenerateReceipt(jsonObject);
            }
            break;
        case 'failure':
            let { message } = response;
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
    }
}

function GenerateReceipt(response) {
    let generatedModal = GenerateHeader(response);
    generatedModal += GenerateReceiptTable(response);
    generatedModal += GenerateModalBottom(response);

    // Clear previous Modal
    document.querySelector('#modal-content').innerHTML = '';

    document
        .querySelector('#modal-content')
        .insertAdjacentHTML('afterbegin', generatedModal);
    $('#receipt-modal').modal({
        keyboard: false,
    });
    ReloadTranslation();
}

async function OrderCommand(sessionid) {
    let queryObj = GetQueryObject();

    let data = {
        queryObj: queryObj,
        sessionid: sessionid,
    };

    await fetch('history/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
            DisplaySweetAlertError(e);
        });
}

function Close() {
    let queryObj = GetQueryObject();

    let data = {
        queryObj: queryObj,
    };

    fetch('history/getapp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
            DisplaySweetAlertError(e);
        });
}

function GenerateHeader(response) {
    let finalHtml = `
    <!-- Top Header -->
    <div class="column-center">
        <div class="column-center">
            <img
                    src="${response.logo_url}"
                    alt="${response.logo_url}"
            />
        </div>
    </div>
    `;
    return finalHtml;
}

function GenerateModalBottom(response) {
    console.log('TABLE FOOTER');
    let footer = ``;
    if (response.footer) {
        for (let i = 0; i < response.footer.length; i++) {
            let currentItem = response.footer[i];
            let temp = `
                <h6 class="text-center">${currentItem.text}</h6>
            `;
            footer = footer.concat(temp);
        }
    }
    let finalhtml = `
    <div class="close-button-container">
        <button
            data-i18n="btn_Close"
            class="var-page-button modal-button"
            style="
                --button-color: ${response.button_bgcolor};
                --button-textcolor: ${response.button_textcolor};
            "
            data-dismiss="modal"
        >
            Close
        </button>
        <div class="column">
            ${footer}
        </div>
    </div>
    `;
    return finalhtml;
}
