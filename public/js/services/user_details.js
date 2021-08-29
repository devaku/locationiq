window.onload = function () {
    ReloadTranslation();
};

function SubmitDetails() {
    // Validate inputs
    LoadingView(true);

    // Validation for form inputs
    let validObj = ValidationFlow();

    if (!validObj.isValid) {
        let error = '';
        if (validObj.extraMessage) {
            error = validObj.extraMessage;
        } else {
            let text = document.querySelector('#sweet-text_ValidContactDetails')
                .innerHTML;

            error = `${text} Invalid: ${validObj.name}`;
        }

        LoadingView(false);
        DisplaySweetAlertError(error);
    } else {
        let queryObj = GetQueryObject();

        // If email doesn't exist, null
        let previousEmail = document.querySelector('#input-previous-email')
            ? document.querySelector('#input-previous-email').value
            : null;
        let formJson = GetFormInputs();

        let data = {
            queryObj,
            formJson,
            previousEmail,
        };

        console.log(data);

        // Send the JSON to the backend
        fetch('user/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then(ResponseHandler)
            .catch((e) => {
                console.log('Fetch ERR!');
                console.log(e);
            });
    }
    ReloadTranslation();
}

if (document.querySelector('#select-date')) {
    document
        .querySelector('#select-date')
        .addEventListener('change', function (e) {
            // On change, load the new timeslots
            let el = e.srcElement;

            if (el.value != '') {
                DateTimeInitial({ date: el.value });
            } else {
                // clearout time list
                let selectElement = document.querySelector('#select-time');
                selectElement.innerHTML = '';
                selectElement.add(new Option('', ''));
            }
        });
}

function GetFormInputs() {
    // Get the form inputs
    let inputs = document.querySelectorAll('.form-inputs');
    inputs = Array.from(inputs);

    let formJson = {};
    for (let x = 0; x < inputs.length; x++) {
        let currentInput = inputs[x];
        console.log(currentInput);
        if (currentInput.name === 'Preferred_schedule') {
            let currentValue = currentInput.value.trim();
            if (currentValue.includes('ASAP')) {
                currentValue = null;
            }
            formJson[currentInput.name] = currentValue;
        } else {
            formJson[currentInput.name] = currentInput.value.trim();
        }
    }

    if (document.querySelector('textarea[name="Instruction"')) {
        let text = document.querySelector('textarea[name="Instruction"');
        formJson['Instruction'] = text.value.trim();
    }
    return formJson;
}

function ResponseHandler(response) {
    let { status, data, message } = response;
    let display = '';
    switch (status) {
        case 'success':
            LoadingView(false);
            SuccessHandler(data);
            break;
        case 'fail':
        case 'error':
            LoadingView(false);
            DisplaySweetAlertError(message);
            break;
        default:
            display = `Unhandled Response!`;
            LoadingView(false);
            DisplaySweetAlertError(display);
            break;
    }
    ReloadTranslation();
}

function SuccessHandler(data) {
    let { type } = data;
    switch (type) {
        case 'validation':
            // Set secret
            document.querySelector('#input-otp-secret').value = data.secret;
            DisplayModal('#modal-otp-validation');
            break;
        case 'resend':
            // Set secret
            document.querySelector('#input-otp-secret').value = data.secret;

            let text = document.querySelector('#sweet-text_OTPSent').innerHTML;
            DisplaySweetAlertInfo(text);
            break;
        case 'close':
            CloseModal('#modal-otp-validation');
            CloseWebview(data.isFacebook);
            break;
        case 'redirect':
            console.log('REDIRECTING');
            window.location.href = data.url;
            break;
        default:
            let display = `Unhandled Response!`;
            DisplaySweetAlertError(display);
            break;
    }
}

// =================
// Display the Modal
// =================

function DisplayConfirmationModal() {
    DisplayModal('#modal-confirm-details');
}

function CloseConfirmationModal(isSubmit) {
    CloseModal('#modal-confirm-details');
    if (isSubmit) {
        // Proceed to POST the data to the backend
        SubmitDetails();
    }
}

// =================
// OTP Related
// =================

function ValidateOTP() {
    let secret = document.querySelector('#input-otp-secret').value;
    let token = document.querySelector('#input-otp').value;
    let formJson = GetFormInputs();
    let queryObj = GetQueryObject();

    let data = {
        queryObj: queryObj,
        secret: secret,
        token: token,
        formJson: formJson,
    };

    // console.log(JSON.stringify(data));

    //Send the JSON to the backend
    fetch('user/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
        });
}

function ResendOTP() {
    let queryObj = GetQueryObject();
    let formJson = GetFormInputs();

    let data = {
        queryObj: queryObj,
        formJson: formJson,
    };

    // console.log(data);

    //Send the JSON to the backend
    fetch('user/resend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(ResponseHandler)
        .catch((e) => {
            console.log('Fetch ERR!');
            console.log(e);
        });
}

// =================
// Date and Time Related
// =================

function GetDateToday() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    return today;
}

function GenerateTimeSlots(timeSlot, samedayFlag) {
    //const quarterInterval = timeSlot.preorder_time_interval * 60;
    //let timeArray = CutTime(timeSlot.preorder_time_start);
    //let startTime = ConvertToMinutes(timeArray);
    //let endTime = ConvertToMinutes(CutTime(timeSlot.preorder_time_end));
    //let isLoop = true;

    let timeIntervals = [];
    let time1 = new Date('1/1/2020 ' + timeSlot.preorder_time_start);
    let time2 = new Date('1/1/2020 ' + timeSlot.preorder_time_end);
    let interval = timeSlot.preorder_time_interval;

    // round start time to next nearest interval
    time1.setMinutes(Math.ceil(time1.getMinutes() / interval) * interval);

    // console.log('TIME SLOTS');
    // console.log(timeSlot);

    // Add ASAP slot

    if (samedayFlag) {
        timeIntervals.push('ASAP - Same Day');
    }

    // Generate the intervals
    while (time1 <= time2) {
        timeIntervals.push(
            time1.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
        );
        time1.setMinutes(time1.getMinutes() + interval);
    }

    /*
    while (isLoop) {

        startTime = startTime + quarterInterval;
        if (Number(startTime) <= Number(endTime)) {
            let NormalTime = ConvertBackToTime(startTime);
            timeIntervals.push(NormalTime);
        } else {
            isLoop = false;
        }
    }
    */

    console.log('GENERATED INTERVALS', JSON.stringify(timeIntervals));

    // Get the select tag
    let selectElement = document.querySelector('#select-time');
    // Clear the previous options
    selectElement.innerHTML = '';
    // Attach the newly generated time intervals
    for (let i = 0; i < timeIntervals.length; i++) {
        selectElement.add(new Option(timeIntervals[i], timeIntervals[i]));
    }
}

function SubmitDateAndTime() {
    let inputDateTime = document.querySelector(
        'input[name="Preferred_schedule"]'
    );

    let elemDate = document.querySelector('#select-date');
    let elemTime = document.querySelector('#select-time');
    let indexDate = elemDate.selectedIndex;
    let indexTime = elemTime.selectedIndex;
    let date = indexDate >= 0 ? elemDate.options[indexDate].text : '';
    let time = indexTime >= 0 ? elemTime.options[indexTime].text : '';

    if (date !== '' && time !== '') {
        inputDateTime.value = date + ' ' + time;
        CloseModal('#modal-date-time-select');
    } else if (date !== '' || time !== '') {
        let text = document.querySelector('#sweet-text_SupplyBothDateAndTime')
            .innerHTML;
        DisplaySweetAlertError(text);
    } else {
        // reset to blank schedule
        inputDateTime.value = 'Select Schedule';
        CloseModal('#modal-date-time-select');
    }
}

function DateTimeInitial({ date }) {
    let timeFilters = JSON.parse(
        document.querySelector('#ejs-var-preorder-filter').innerHTML
    );

    // Find the respective data
    let timeSlot = timeFilters.find(
        (element) => element.preorder_date === date
    );

    console.log('TIME FILTERS', JSON.stringify(timeFilters));
    console.log('TIME SLOT', JSON.stringify(timeSlot));

    // If 0, then it means it's on the same day
    let timeSlotDate = timeSlot.preorder_date;
    let dateToday = GetDateToday();
    let samedayFlag = false;
    if (dateToday === timeSlotDate) {
        samedayFlag = true;

        console.log('DATE TODAY: ', dateToday);
        console.log('SELECTED TIME SLOT: ', timeSlot);
    }

    // Generate the timeslots
    GenerateTimeSlots(timeSlot, samedayFlag);
}

function ShowDateTimeSelection() {
    let inputDateTime = document.querySelector(
        'input[name="Preferred_schedule"]'
    );

    // If there's already a preferred schedule
    if (inputDateTime.value !== 'Select Schedule') {
        // Load that in
        let timeArray = inputDateTime.value.split(' ');
        let date = timeArray[0];
        let time = timeArray[1] + ' ' + timeArray[2];

        DateTimeInitial({ date });

        // Set the selected values
        document.querySelector('#select-date').value = date;
        document.querySelector('#select-time').value = time;
    }

    // Find the respective data
    //let timeSlot = timeFilters[0];
    //GenerateTimeSlots(timeSlot);

    DisplayModal('#modal-date-time-select');
}

/*
function ConvertBackToTime(time) {
    // so your time is in HH:MM:SS we want to convert this to just seconds. 3600s in an hour and 60s in a minute so the total seconds = hours * 3600 + minutes * 60 + seconds
    let hours = Math.floor(time / 3600)
        .toString()
        .padStart(2, '0');
    let minutes = (Math.floor(time / 60) % 60).toString().padStart(2, '0');
    // let seconds = (time % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function ConvertToMinutes(timeArray) {
    // return (timeArray[0] * 60 + timeArray[1]) * 60 + timeArray[2];
    return (timeArray[0] * 60 + timeArray[1]) * 60;
}

function CutTime(time) {
    let timeArray = time.split(':').map((str) => Number(str));
    return timeArray;
}
*/

// =================
// Validate the Form Inputs
// =================

// Validate the form inputs for submitting to the backend
function ValidationFlow() {
    let inputs = document.querySelectorAll('.form-inputs');
    inputs = Array.from(inputs);
    console.log(inputs);
    let isValid = true;
    let name = '';
    let extraMessage;
    for (let i = 0; i < inputs.length; i++) {
        let currentInput = inputs[i];
        name = currentInput.name;

        if (currentInput.name.toLowerCase() === 'phone') {
            isValid = ValidatePhone(currentInput.value);
        } else if (currentInput.name.toLowerCase() === 'name') {
            let userinputname = currentInput.value;

            // Name cannot be blank
            // And name cannot be "guest"
            if (
                userinputname.trim() &&
                userinputname.trim().toLowerCase() != 'guest'
            ) {
                isValid = true;
            } else {
                isValid = false;
                extraMessage = 'Name cannot be "guest" or be blank.';
            }
        } else if (currentInput.name.toLowerCase() === 'email') {
            isValid = ValidateEmail(currentInput.value);
        } else if (currentInput.name.toLowerCase() === 'preferred_schedule') {
            // check if preorder is mandatory
            extraMessage = ValidateDateTime();
            if (extraMessage) {
                isValid = false;
            } else {
                // For the case with having a table number and date time
                extraMessage = ValidateDateTimeAndTableNumber();
                if (extraMessage) {
                    isValid = false;
                }
            }
        }
        console.log(isValid);

        if (!isValid) {
            break;
        }
    }

    return {
        isValid: isValid,
        name: name,
        extraMessage: extraMessage,
    };
}

function ValidateDateTimeAndTableNumber() {
    console.log('ValidateDateTimeAndTableNumber');
    let inputDateTime = document.querySelector(
        'input[name="Preferred_schedule"]'
    );

    let tableNumber = document.querySelector('input[name="Table_number"]');

    // If preferred schedule and table number exist
    if (inputDateTime && tableNumber) {
        // One should be filled
        if (
            // blank
            inputDateTime.value === 'Select Schedule' &&
            // blank
            tableNumber.value === ''
        ) {
            return 'Please specify either a table number or a preferred schedule.';
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function ValidateDateTime() {
    let inputDateTime = document.querySelector(
        'input[name="Preferred_schedule"]'
    );
    let required = JSON.parse(
        document.querySelector('#ejs-var-preorder-required').innerHTML
    );

    // Check if the damn thing exists first
    if (inputDateTime) {
        if (inputDateTime.value === 'Select Schedule') {
            // Assume instant
            if (required) {
                return 'Please set your preferred schedule.';
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function ValidateEmail(email) {
    // prettier-ignore
    let regex = new RegExp("[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return regex.test(email);
}

function ValidatePhone(phone) {
    let regex = new RegExp(
        //'(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
        '[0-9]{7,15}'
    );
    return regex.test(phone);
}
