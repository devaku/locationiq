let timerID;

window.onload = function () {
    ConvertTimestamps();
    StartTimer();
    window.scrollTo(0, document.querySelector('#chat-messages').scrollHeight);
    ReloadTranslation();
    // StartChatCloseTimer();
    let timerLength = document.querySelector('#ejs-var-chat-timer').innerHTML;
    timerLength = parseInt(timerLength, 10);
    console.log('Chat Close Timer: ', timerLength);
};

function StartChatCloseTimer() {
    let timerLength = document.querySelector('#ejs-var-chat-timer').innerHTML;
    timerLength = parseInt(timerLength, 10);

    // 60000 = 1 minute
    timerLength = timerLength * 60000;

    // 60000
    if (timerLength) {
        timerLength = parseInt(timerLength);
        timerID = setTimeout(ChatTimer, timerLength);
    }
}

async function ChatTimer() {
    console.log('Running Chat off timer');
    let queryObject = GetQueryObject();
    let data = {
        queryObject,
    };

    let fetchResponse = await fetch('chat/timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .catch((e) => {
            console.log('Fetch ERROR!');
            console.log(e);
            DisplaySweetAlertError(e);
        });

    clearTimeout(timerID);
    ResponseHandler(fetchResponse);
}

function StartTimer() {
    // 1000 = 1 second
    // 60000 = 1 minute
    let minutes = 5 * 60000;
    let timerIntervalID;

    // 5 minutes
    timerIntervalID = this.setInterval(this.FetchRefresher, minutes);
    // Start timer
    timerIntervalID;
}

function ConvertTimestamps() {
    // Convert all Timestamps into moments
    let timestamps = document.querySelectorAll('.chat_timestamp');
    timestamps = Array.from(timestamps);
    // console.log(timestamps);
    timestamps.forEach(function (currentTimestamp, index) {
        let time = currentTimestamp.innerHTML;
        time = ParseTimestamp(time.trim());
        currentTimestamp.innerHTML = time;
    });
}

// ==================
// REFRESH CHAT RELATED
// ==================

async function FetchRefresher() {
    let queryObject = GetQueryObject();
    let data = {
        queryObject,
    };

    let fetchResponse = await fetch('chat/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .catch((e) => {
            console.log('Fetch ERROR!');
            console.log(e);
            DisplaySweetAlertError(e);
        });

    ResponseHandler(fetchResponse);
}

function RefreshChatWindow(style, history) {
    // Begin refreshing the UI. lol
    let divChat = document.querySelector('#chat-messages');
    let htmlInput = '';
    if (!history) {
        htmlInput = `
        <!-- No chat history yet -->
        <div
            class="chat-bubble var-chat-bubble-style-sender column-space animate__animated animate__fadeInDown"
            style="
                --sender_textcolor: ${style.sender_textcolor};
                --sender_bgcolor: ${style.sender_bgcolor};
            "
        >
            <div class="element-full-width align-center">
                <p>
                    <span class="text-bold" data-i18n="text_BOTTYMessage">
                        BOTTY GENERATED MESSAGE</span
                    >
                </p>
            </div>
            <div class="element-full-width align-center">
                <p data-i18n="text_MessageToAdmins">
                    Send a message to the admins!
                </p>
            </div>
        </div>
        `;
    } else {
        history.forEach(function (currentChatBubble, index) {
            if (currentChatBubble.sender_name) {
                htmlInput += `
                <div
                    class="chat-bubble var-chat-bubble-style-receiver animate__animated animate__fadeInLeft"
                    style="
                        --other_textcolor: ${style.other_textcolor};
                        --other_bgcolor: ${style.other_bgcolor};
                    "
                    >
                    <div class="element-full-width align-left">
                        <p>
                            <span class="text-bold"
                                > ${currentChatBubble.sender_name}</span
                            >
                            <span class="text-italic chat_timestamp">
                                ${currentChatBubble.time_stamp}
                            </span>
                        </p>
                    </div>
                    <div class="element-full-width align-left">
                        <p>
                            ${currentChatBubble.chat_msg.replace(/[\\]+/g, '')}
                        </p>
                    </div>
                </div>
                `;
            } else {
                htmlInput += `
                <div
                    class="chat-bubble var-chat-bubble-style-sender animate__animated animate__fadeInRight"
                    style="
                        --sender_textcolor: ${style.sender_textcolor};
                        --sender_bgcolor: ${style.sender_bgcolor};
                    "
                >
                    <div class="element-full-width align-right">
                        <p>
                            <span class="text-italic chat_timestamp">
                                ${currentChatBubble.time_stamp}
                            </span>
                        </p>
                    </div>
                    <div class="element-full-width align-right">
                        <p>
                            ${currentChatBubble.chat_msg.replace(/[\\]+/g, '')}
                        </p>
                    </div>
                </div>
                `;
            }
        });
    }

    // Remove the previous messages
    divChat.innerHTML = '';
    divChat.innerHTML = htmlInput;
    ConvertTimestamps();

    // Set scrollbar to the bottom
    window.scrollTo(0, divChat.scrollHeight);
}

function ParseTimestamp(timestamp) {
    // timestamp should be in ISO format
    // let timestamp = '2020-05-14T01:09:42.56163+00:00';
    let localTime = new Date(timestamp); // automatic timezone conversion
    let relativeTime = moment(localTime).fromNow();
    return relativeTime;
}

$(document).on('input', 'textarea', function () {
    // console.log($(this).outerHeight);
    $(this).outerHeight(38).outerHeight(this.scrollHeight); // 38 or '1em' -min-height
});

// document.querySelector('textarea').addEventListener('input', function (el) {
//     console.log(el);
//     let currentElement = el.srcElement;
//     console.log(currentElement);
//     // el.outerHeight(38).outerHeight(el.scrollHeight); // 38 or '1em' -min-height
// });

document
    .querySelector('#send-button')
    .addEventListener('click', async function (el) {
        let userMessage = document.querySelector('#messageText').value;

        // Clear the textbox
        let messageArea = document.querySelector('#messageText');
        messageArea.value = '';
        $(messageArea).outerHeight(38).outerHeight(messageArea.scrollHeight);

        //Escape special characters
        userMessage = userMessage.replace(/[.*+?^${}()'"|[\]\\]/g, '\\$&');
        userMessage = userMessage.trim();

        if (userMessage === '') {
            return;
        } else {
            if (userMessage.length > 100) {
                let text = document.querySelector(
                    '#sweet-text_ChatMessageLength'
                ).innerHTML;

                DisplaySweetAlertInfo(text);
                return;
            }
            let queryObject = GetQueryObject();

            let data = {
                queryObject: queryObject,
                message: userMessage,
                chatflag: queryObject.chatflag,
                chatid: queryObject.chatid,
            };

            // Reset the timer
            StartTimer();

            // Reset the timer for the chatWindow
            clearTimeout(timerID);
            StartChatCloseTimer();

            let fetchResponse = await fetch('chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .catch((e) => {
                    console.log('Fetch ERROR!');
                    console.log(e);
                    DisplaySweetAlertError(e);
                });

            ResponseHandler(fetchResponse);
        }
    });

function ResponseHandler(response) {
    let { status, data } = response;
    switch (status) {
        case 'success':
            SuccessHandler(data);
            break;
        case 'error':
        default:
            DisplaySweetAlertError(response.message);
    }
    ReloadTranslation();
}

function SuccessHandler(data) {
    let { type, style, history } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'refresh':
            RefreshChatWindow(style, history);
            break;
        default:
            DisplaySweetAlertError('Unhandled Success Response!');
    }
}
