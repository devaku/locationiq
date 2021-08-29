window.onload = function () {
    let generatedTable = OnLoadGenerateTable();
    console.log(generatedTable);
    document
        .querySelector('#ejs-generated-table')
        .insertAdjacentHTML('afterend', generatedTable);
    // Remove marker
    let element = document.querySelector('#ejs-generated-table');
    element.parentNode.removeChild(element);

    let receiptJson = document.querySelector('#ejs-receipt-json').innerHTML;
    receiptJson = JSON.parse(receiptJson);
    let html = GenerateBottomFooter(receiptJson);
    console.log(html);
    document
        .querySelector('#ejs-receipt-bottom-footer')
        .insertAdjacentHTML('afterend', html);

    // Remove marker
    element = document.querySelector('#ejs-receipt-bottom-footer');
    element.parentNode.removeChild(element);

    ReloadTranslation();
};

function Close() {
    let queryObj = GetQueryObject();

    let data = {
        queryObj: queryObj,
    };

    fetch('getapp', {
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

function ResponseHandler(response) {
    let { status, data } = response;
    switch (status) {
        case 'success':
            CloseWebview(data.isFacebook);
            break;
        case 'error':
        default:
            DisplaySweetAlertError(response.message);
    }
}

function GenerateModalBottom(response) {
    console.log('TABLE FOOTER');
    let footer = ``;
    if (response.footer) {
        for (let i = 0; i < response.footer.length; i++) {
            let currentItem = response.footer[i];
            let temp = `
        <h5 class="text-center">${currentItem.text}</h5>
        `;
            footer = footer.concat(temp);
        }
    }
    let finalhtml = `
    <div class="modal-footer column">
        <button
            class="modal-button var-page-button"
            style="
                --button-color: ${response.button_bgcolor};
                --button-textcolor: ${response.button_textcolor};
                padding: 10px;
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
