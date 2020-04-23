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
