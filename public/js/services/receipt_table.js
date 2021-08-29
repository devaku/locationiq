// Used by receipt_breakdown
// and receipt_summary

function OnLoadGenerateTable() {
    console.log('ONLOAD');
    let receiptjson = document.querySelector('#ejs-receipt-json').innerHTML;
    receiptjson = JSON.parse(receiptjson);
    console.log(receiptjson);
    let generatedTable = GenerateReceiptTable(receiptjson);
    return generatedTable;
}

function GenerateReceiptTable(response) {
    let topLevelInfo = `
    <div class="column-center">
        <h4>${response.title ? response.title : ''}</h4>
        <h6>${response.subtitle ? response.subtitle : ''}</h6>
    </div>
    `;
    var decimal = response.decimal; // decimal place setting
    var showCategory = response.category_as_stall;
    var currentCategory = '';

    console.log('HEADER');
    let header = ``;
    if (response.header) {
        for (let i = 0; i < response.header.length; i++) {
            let currentHeader = response.header[i];
            let temp = `<h6><span class="text-bold">${currentHeader.label}:</span> ${currentHeader.text}</h6>`;
            if (currentHeader.label == 'Instruction') {
                let newlineText = currentHeader.text
                    .toString()
                    .replace(/\n/g, '<br>');
                temp = `<h6><span class="text-bold">${currentHeader.label}:</span> <div style="margin-left:1em;">${newlineText}</div></h6>`;
            }
            header = header.concat(temp);
        }
    }

    let finalHeader = `
    <div class="element-full-width">
    ${header}
    </div>
    `;

    console.log('TABLE BODY');
    let tbody = ``;
    let itemPadding = showCategory == true ? 'style="padding-left:5%"' : '';

    if (response.items) {
        for (let i = 0; i < response.items.length; i++) {
            // The main product
            let currentItem = response.items[i];
            let itemQty =
                currentItem.base_price == null ? '' : currentItem.quantity;
            let temp = ``;

            if (
                showCategory == true &&
                currentItem.category != null &&
                currentCategory != currentItem.category
            ) {
                currentCategory = currentItem.category;
                temp += `
                <tr>
                    <td><b><i>STALL: ${currentCategory}</i></b></td>
                    <td><b><i>${currencyFormat(
                        currentItem.category_sum,
                        decimal
                    )}</i></b></td>
                    <td></td>
                </tr>
                `;
            }

            if (currentItem.quantity === 1) {
                temp += `
                <tr>
                    <td ${itemPadding} colspan="2"><b>${itemQty} ${
                    currentItem.name
                }</b></td>
                    <td><b>${currencyFormat(
                        currentItem.price,
                        decimal
                    )}</b></td>
                </tr>
                `;
            } else {
                let subTotal = currentItem.quantity * currentItem.price;
                temp += `
                <tr>
                    <td ${itemPadding}><b>${itemQty} ${
                    currentItem.name
                }</b></td>
                    <td valign="bottom"><b>${currencyFormat(
                        currentItem.price,
                        decimal
                    )}</b></td>
                    <td><b>${currencyFormat(subTotal, decimal)}</b></td>
                </tr>
                `;
            }
            if (
                currentItem.base_price &&
                currentItem.base_price !== currentItem.price
            ) {
                temp += `
                <tr>
                    <td style="padding-left:5%">Base Price</td>
                    <td><span>${currencyFormat(
                        currentItem.base_price,
                        decimal
                    )}</span></td>
                    <td></td>
                </tr>
                `;
            }
            tbody = tbody.concat(temp);
            // The additional, if there are any
            if (currentItem.description) {
                for (
                    let counter = 0;
                    counter < currentItem.description.length;
                    counter++
                ) {
                    let currentDescription = currentItem.description[counter];
                    // Iterate the additionals
                    if (currentDescription.option) {
                        for (
                            let optionCounter = 0;
                            optionCounter < currentDescription.option.length;
                            optionCounter++
                        ) {
                            let currentOption =
                                currentDescription.option[optionCounter];
                            // Two spaces
                            let temp = ``;
                            if (
                                currentOption.quantity === 1 &&
                                currentOption.price !== undefined &&
                                currentOption.price !== null
                            ) {
                                temp += `
                                <tr>                            
                                    <td style="padding-left:5%">${
                                        currentOption.option_name
                                    }</td>
                                    <td><span>${currencyFormat(
                                        currentOption.price,
                                        decimal
                                    )}</span></td>
                                    <td></td>
                                </tr>
                                `;
                            } else {
                                temp += `
                                <tr>
                                    <td style="padding-left:5%" colspan="3">${currentOption.option_name}</td>
                                </tr>
                                `;
                                if (
                                    currentOption.price !== undefined &&
                                    currentOption.price !== null
                                ) {
                                    let subTotal =
                                        currentOption.quantity *
                                        currentOption.price;
                                    temp += `
                                    <tr style="line-height:.7rem">
                                        <td style="padding-left:5%"><span style="font-size:small">(${
                                            currentOption.quantity
                                        } x ${currencyFormat(
                                        currentOption.price,
                                        decimal
                                    )})</span></td>
                                        <td><span>${currencyFormat(
                                            subTotal,
                                            decimal
                                        )}</span></td><td></td>
                                    </tr>`;
                                }
                            }

                            tbody = tbody.concat(temp);
                            if (currentOption.suboption_group) {
                                for (
                                    let suboptionCounter = 0;
                                    suboptionCounter <
                                    currentOption.suboption_group.length;
                                    suboptionCounter++
                                ) {
                                    let currentSub =
                                        currentOption.suboption_group[
                                            suboptionCounter
                                        ];
                                    for (
                                        let lastCounter = 0;
                                        lastCounter <
                                        currentSub.suboption.length;
                                        lastCounter++
                                    ) {
                                        let lastSub =
                                            currentSub.suboption[lastCounter];
                                        let temp = ``;
                                        if (
                                            lastSub.quantity === 1 &&
                                            lastSub.price !== undefined &&
                                            lastSub.price !== null
                                        ) {
                                            temp += `
                                            <tr>                            
                                                <td style="padding-left:10%">${
                                                    lastSub.suboption_name
                                                }</td>
                                                <td><span>${currencyFormat(
                                                    lastSub.price,
                                                    decimal
                                                )}</span></td>
                                                <td></td>
                                            </tr>
                                            `;
                                        } else {
                                            temp += `
                                            <tr>
                                                <td style="padding-left:10%" colspan="3">${lastSub.suboption_name}</td>
                                            </tr>
                                            `;
                                            if (
                                                lastSub.price !== undefined &&
                                                lastSub.price !== null
                                            ) {
                                                let subTotal =
                                                    lastSub.quantity *
                                                    lastSub.price;
                                                temp += `
                                                <tr style="line-height:.7rem">
                                                    <td style="padding-left:5%"><span style="font-size:small">(${
                                                        lastSub.quantity
                                                    } x ${currencyFormat(
                                                    lastSub.price,
                                                    decimal
                                                )})</span></td>
                                                    <td><span>${currencyFormat(
                                                        subTotal,
                                                        decimal
                                                    )}</span></td><td></td>
                                                </tr>`;
                                            }
                                        }
                                        tbody = tbody.concat(temp);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let table = `
    <div id="receipt-view" class="container" 
        style="
            --bgcolor: ${response.bgcolor};
            --textcolor: ${response.textcolor};
            "
        >
        <div class="column-center">
            <!-- Top level info -->
            ${topLevelInfo}
            <!-- Header -->
            ${finalHeader}
            <div class="column-center table-container">
                <table class="">
                    <thead>
                        <tr>
                            <th>Item(s)</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbody}
                    </tbody>
                    <tfoot>
                        <td></td>
                        <td><b>Total:</b></td>
                        <td><b>${response.currency} ${currencyFormat(
        response.amount,
        decimal
    )}</b></td>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
    `;

    return table;
}

function GenerateBottomFooter(response) {
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
    let finalHtml = `
    <div class="close-button-container">
        <button
            data-i18n="btn_Close"
            class="var-page-button"
            style="
            padding: 10px;
            margin-bottom: 10px;
            --button-color: ${response.button_bgcolor};
            --button-textcolor: ${response.button_textcolor};"
            onclick="Close()"
            >
            Close
        </button>
     
        <div class="column-center">
            ${footer}
        </div>
    </div>
    `;
    //     <input
    //     class="var-page-button"
    //     style="
    //         padding: 10px;
    //         margin-bottom: 10px;
    //         --button-color: ${response.button_bgcolor};
    //         --button-textcolor: ${response.button_textcolor};
    //     "
    //     type="button"
    //     onclick="Close()"
    //     value="Close"
    // />
    return finalHtml;
}

function currencyFormat(num, place) {
    try {
        return num.toFixed(place).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        /*
        if (num) {
            return num.toFixed(place).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        } else {
            return '';
        }
    */
    } catch (e) {
        console.log(e);
    }
}
