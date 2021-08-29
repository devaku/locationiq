liff.init(
    (data) => {
        const userId = data.context.userId;
    },
    (err) => {}
);

// Get the query string from the URL
function GetQueryObject() {
    const urlParams = new URLSearchParams(window.location.search);
    let queryObject = {};
    for (const [key, value] of urlParams.entries()) {
        queryObject[key] = decodeURIComponent(value);
    }
    return queryObject;
}

/*
 * Closes the webview depending on the bot type
 * */
function CloseWebview(isFacebook = false) {
    try {
        // If facebook, just redirect to the close page
        if (isFacebook) {
            console.log('CLOSING FACEBOOK WINDOW');
            location.href = window.location.origin + '/webpages/closing.html';
        } else {
            // For Viber
            DisplayCloseMessage();

            // This is mostly for LIFF
            // Just close the window
            window.shouldClose = true;
            window.close();
            liff.closeWindow();
        }
    } catch (err) {}
}

// Display Close Message for VIBER
function DisplayCloseMessage() {
    // Hide the main view
    let mainView = document.querySelector('#main-view');
    mainView.classList.add('hidden');

    // Display close webview message
    // This is primarily here for Viber
    // Viber webview does not close
    let closeView = document.querySelector('#z-close-view');
    closeView.classList.remove('hidden');
}

// =======================
// DISPLAY ELEMENTS
// =======================

function ShowHiddenElement(selector) {
    document.querySelector(selector).classList.remove('hidden');
}

function HideHiddenElement(selector) {
    document.querySelector(selector).classList.add('hidden');
}

// =======================
// DISPLAY MODALS
// =======================

function DisplayModal(id) {
    $(id).modal({
        keyboard: false,
        backdrop: 'static',
    });
}

function CloseModal(id) {
    $(id).modal('hide');
}

// =======================
// DISPLAY SWEET ALERTS
// =======================

function DisplaySweetAlertInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Information',
        text: message,
        confirmButtonText: 'OK',
    });
}

// Display message using SweetAlert
function DisplaySweetAlertError(error) {
    Swal.fire({
        title: 'Oops... &#128563;',
        text: error,
        iconHtml: '&#128563;',
        confirmButtonText: 'OK',
    });
}

// =======================
// DISPLAY LOADING ICON
// =======================

function LoadingView(isLoading) {
    if (isLoading) {
        // Show loading
        document.querySelector('.zloading-button').classList.add('hidden');
        document.querySelector('#loading-view').classList.remove('hidden');
    } else {
        // No longer loading
        document.querySelector('.zloading-button').classList.remove('hidden');
        document.querySelector('#loading-view').classList.add('hidden');
    }
}
