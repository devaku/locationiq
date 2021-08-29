document.querySelectorAll('.button-container').forEach((el) => {
    el.addEventListener('click', async function (e) {
        console.log('SENDING COMMAND');
        let command = e.target.value;
        await SendCommand(command);
    });
});

async function SendCommand(command) {
    let queryObject = GetQueryObject();
    let data = {
        queryObj: queryObject,
        command: command,
    };

    console.log('SENDING FETCH COMMAND');
    let fetchResponse = await fetch('command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .catch((e) => {
            console.log('Fetch ERROR');
            console.log(e);
        });
    ResponseHandler(fetchResponse);
}

function ResponseHandler(response) {
    let { status, message, data } = response;
    switch (status) {
        case 'success':
            CloseWebview(data.isFacebook);
            break;
        case 'error':
            DisplaySweetAlertError(message);
            break;
        default:
            DisplaySweetAlertError('Unhandled response!');
            break;
    }
}
