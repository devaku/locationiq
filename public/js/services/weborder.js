window.onload = async function () {
    // Load default navigation
    StartupNavigation();

    // Rewards Button, if it exists
    StartupRewardsButton();

    // Footer style
    StartupFooter();

    // Style the lower-section
    StartupLowerSection();

    // Style the modal
    // StartupModal();
    try {
        ReloadTranslation();
    } catch (e) {
        console.log('ReloadTranslation was not loaded');
    }
};

// Setup isScrolling variable
// let isScrolling;

// Listen for scroll events
// window.addEventListener(
//     'scroll',
//     function (event) {
//         // Clear our timeout throughout the scroll
//         window.clearTimeout(isScrolling);

//         // Set a timeout to run after scrolling ends
//         isScrolling = setTimeout(function () {
//             // Run the callback
//             console.log('Scrolling has stopped.');
//         }, 66);
//     },
//     false
// );
function StartupLowerSection() {
    // Get top height
    let topHeight = document.querySelector('#top-section').offsetHeight;

    // // Get footer height
    // let footerHeight = document.querySelector('.footer-bar').offsetHeight;

    // let lowerSectionHeight = topHeight + footerHeight;
    document
        .querySelector('.lower-section')
        .setAttribute('style', `height: calc(100% - ${topHeight + 30}px)`);
}

function StartupRewardsButton() {
    // Get the style
    let tabsStyle = JSON.parse(
        document.querySelector('#ejs-var-navstyle').innerHTML
    );

    let rewardsButton = document.querySelector('.button-rewards');
    if (rewardsButton) {
        rewardsButton.style.backgroundColor = tabsStyle.bgcolor;
        rewardsButton.style.color = tabsStyle.textcolor;
    }
}

function StartupNavigation() {
    // no nav tabs for rewards
    let isRewards = document.querySelector('#ejs-var-page-mode').value;
    if (isRewards === 'rewards') {
        return;
    }

    // Get the tabs in the holder

    let jsonTabs = document.querySelector('#ejs-var-navtabs').innerHTML.trim();
    if (jsonTabs) {
        jsonTabs = JSON.parse(jsonTabs);
    }

    // Get the style
    let tabsStyle = document
        .querySelector('#ejs-var-navstyle')
        .innerHTML.trim();
    if (tabsStyle) {
        tabsStyle = JSON.parse(tabsStyle);
    }

    if (jsonTabs) {
        let menuList = jsonTabs.menu_list;
        for (let x = 0; x < menuList.length; x++) {
            let currentTab = menuList[x];

            // Generate the nav tabs
            GenerateNavigationButton(
                jsonTabs.bgcolor,
                jsonTabs.textcolor,
                currentTab.category_name,
                currentTab.command
            );
        }
    }
}

function StartupFooter() {
    // Get footer
    let footer = document.querySelector('.footer-bar');

    // Get the style
    let tabsStyle = JSON.parse(
        document.querySelector('#ejs-var-navstyle').innerHTML
    );

    let isRewards = document.querySelector('#ejs-var-page-mode').value;
    console.log('PAGE MODE: ', isRewards);
    console.log('TABS STYLE: ', JSON.stringify(tabsStyle));

    if (isRewards === 'rewards') {
        footer.style.backgroundColor = tabsStyle.bgcolor;
    } else {
        footer.style.backgroundColor = 'whitesmoke';
    }
}

function StartupModal() {
    // Get the style
    let tabsStyle = JSON.parse(
        document.querySelector('#ejs-var-navstyle').innerHTML
    );

    // Get the footer
    let modalFooter = document.querySelector('.modal-footer');

    // Target the buttons in the footer
    let modalButtons = Array.from(modalFooter.querySelectorAll('button'));

    for (let x = 0; x < modalButtons.length; x++) {
        let currentTab = modalButtons[x];
        currentTab.style.cssText = `
        --bgcolor: ${tabsStyle.bgcolor};
        --textcolor: ${tabsStyle.textcolor};
        `;
    }
}

// ==============
// Display related functions
// ==============

// Mainly used to update and DELETE navbuttons
function UpdateNavBar(navButtons) {
    ShowHideNavBar(true);

    // Clear the navbar
    document.querySelector('#navigation-area').innerHTML = '';
    for (let x = 0; x < navButtons.length; x++) {
        let currentNav = navButtons[x];
        document.querySelector('#navigation-area').appendChild(currentNav);
    }
}

function UpdateCardsAndMessages(messages, cards) {
    document.querySelector('#message-area').innerHTML = messages;
    document.querySelector('#card-area').innerHTML = cards;
}

function ShowHideNavBar(isActive) {
    let isRewards = document.querySelector('#ejs-var-page-mode').value;
    // Just as a precaution. lol
    if (isRewards === 'order') {
        if (isActive) {
            document
                .querySelector('#navigation-area')
                .classList.add('row-left-align');
            document
                .querySelector('#navigation-area')
                .classList.remove('hidden');
        } else {
            document
                .querySelector('#navigation-area')
                .classList.remove('row-left-align');
            document.querySelector('#navigation-area').classList.add('hidden');
        }
    }
}

function ShowSearch() {
    // Hide or Show the search bar depending on its current status
    // ON and OFF
    let searchBar = document.querySelector('#search-area');
    if (searchBar.classList.contains('hidden')) {
        ShowHiddenElement('#search-area');
        document.querySelector('.search-textbox').value = '';
        document.querySelector('.search-textbox').focus();
    } else {
        HideHiddenElement('#search-area');
    }
}

function Scroll(direction, categoryid) {
    // console.log('DIRECTION: ', direction);
    // console.log('ID: ', categoryid);
    if (direction === 'top') {
        // console.log('SCROLLING TOP');
        // window.location.href = '#marker-top';
        document
            .querySelector('#marker-top')
            .scrollIntoView({ behavior: 'smooth' });
    } else if (direction === 'bottom') {
        // console.log('SCROLLING DOWN');
        // window.location.href = '#marker-bottom';
        document
            .querySelector('#marker-bottom')
            .scrollIntoView({ behavior: 'smooth' });
    } else {
        if (document.getElementById(`${categoryid}`)) {
            // console.log('CATEGORY SCROLL');

            document
                .getElementById(`${categoryid}`)
                .scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ==============
// Modal related functions
// ==============

// ==============
// UI Generation functions
// ==============

// Used to attach a navbutton (when pressing a command)
function GenerateNavigationButton(bgcolor, textcolor, name, command) {
    ShowHideNavBar(true);

    // Count the number nav buttons on display
    let index = 0;
    let navButtons = Array.from(document.querySelectorAll('.nav-button'));
    if (navButtons) {
        index = navButtons.length;
    } else {
        index = 0;
    }

    let htmlTemplateNavButton = `
    <button class="nav-button ejs-var-style-card-button" 
        style=
        "
        --bgcolor: ${bgcolor};
        --textcolor: ${textcolor};
        "
        value="${command}"
        onclick="NavigationCommand(this, ${index})">
        ${name}
    </button>
    `;

    // Attach this to the DOM
    document
        .querySelector('#navigation-area')
        .insertAdjacentHTML('beforeend', htmlTemplateNavButton);
}

// ==============
// Handler related functions
// ==============

async function TextSearch(el) {
    LoadingView(true);
    ShowHideNavBar(false);
    ShowSearch(false);
    // Get the textbox
    console.log('SEARCHING');
    let search = document.querySelector('.search-textbox').value.trim();
    console.log(search);
    if (!search || search === '') {
        // do nothing
    } else {
        // If not, POST to the backend
        let queryObject = GetQueryObject();
        let values = {
            command: search,
            queryObject,
        };
        let baseURL = document.querySelector('#ejs-var-baseurl').value;
        // webinterface/command
        let fetchResponse = await fetch(`${baseURL}/command`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((response) => response.json())
            .catch((error) => {
                console.log('');
                console.log('FETCH ERROR');
                console.log(error);
            });

        ResponseHandler(fetchResponse);
    }
    ShowHideNavBar(true);
    LoadingView(false);
}

// This is the function that handles button input
async function ButtonCommand(el, isWeb, isFooter) {
    let currentCommand = el.value;
    console.log('Current Command: ', currentCommand);
    console.log('Is webview: ', isWeb);
    // If webview, then redirect to it
    if (isWeb) {
        let isRewards = document.querySelector('#ejs-var-page-mode').value;
        // Just as a precaution. lol
        if (isRewards === 'order') {
            LoadingView(true);
        }
        window.location.href = currentCommand;
    } else {
        LoadingView(true);
        // If not a footer command, then make a navigation button
        if (!isFooter) {
            // Get the Title to be used as the name of the button
            // Go up the DOM to the card itself
            let mainCard = el.parentNode.parentNode;
            // Get the title
            let title = mainCard.querySelector('.text-title');
            let name = title.innerText;

            // Get the style
            let tabsStyle = JSON.parse(
                document.querySelector('#ejs-var-navstyle').innerHTML
            );

            // Add a Navigation button
            // GenerateNavigationButton(
            //     tabsStyle.bgcolor,
            //     tabsStyle.textcolor,
            //     name,
            //     currentCommand
            // );

            // Save tabs
            // await SaveNavigationTabs();
        }
        // If footer command, clear the tabs
        else {
            // Count the nav buttons
            // let navButtons = Array.from(
            //     document.querySelectorAll('.nav-button')
            // );

            // // Clear tabs except for the very first one
            // let index = 0;
            // if (index + 1 < navButtons.length) {
            //     let finalNavButtons = navButtons.slice(0, index + 1);
            //     // Update the Nav Buttons
            //     UpdateNavBar(finalNavButtons);
            // }
            // Then hide it
            ShowHideNavBar(false);
        }

        // If not, POST to the backend
        let queryObject = GetQueryObject();
        let values = {
            command: currentCommand,
            queryObject,
        };

        // Get base URL
        let baseURL = document.querySelector('#ejs-var-baseurl').value;
        // webinterface/command
        let fetchResponse = await fetch(`${baseURL}/command`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((response) => response.json())
            .catch((error) => {
                console.log('');
                console.log('FETCH ERROR');
                console.log(error);
            });

        ResponseHandler(fetchResponse);
    }
    LoadingView(false);
    ShowHideNavBar(true);
}

// Separated ButtonCommands for Rewards
async function ButtonCommandRewards(el) {
    let isValid = ValidateRewards();
    // Do not continue
    console.log('VALIDATION: ', isValid);
    if (!isValid) {
        return;
    }
    LoadingView(true);

    console.log(el);

    // Hide the button
    el.classList.add('hidden');

    // Get promoid
    let promoID = el.value;
    let currentCommand = `apply_promo:${promoID}`;

    // If not, POST to the backend
    let queryObject = GetQueryObject();
    let values = {
        command: currentCommand,
        queryObject,
    };

    // Get base URL
    let baseURL = document.querySelector('#ejs-var-baseurl').value;

    // webinterface/command
    let fetchResponse = await fetch(`${baseURL}/command`, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(error);
        });

    ResponseHandler(fetchResponse);
    LoadingView(false);
}

function ValidateRewards() {
    let max = parseInt(document.querySelector('#ejs-var-reward-max').value);
    let min = parseInt(document.querySelector('#ejs-var-reward-min').value);
    let count = parseInt(document.querySelector('#ejs-var-reward-count').value);

    if (count < min && count <= max) {
        DisplaySweetAlertInfo(
            `Reward items should be at least ${min} but not more than ${max}`
        );
        return false;
    } else if (count > max && count >= min) {
        DisplaySweetAlertInfo('Options need to be deselected!');
        return false;
    } else {
        return true;
    }
}

async function SaveNavigationTabs() {
    console.log('SAVING NAVIGATION TABS');
    // Get the navigation tabs
    let navButtons = Array.from(document.querySelectorAll('.nav-button'));
    navButtons = navButtons.map((el) => {
        return {
            name: el.innerText.trim(),
            command: el.value,
        };
    });
    let values = {
        navigation: navButtons,
    };

    // Get base URL
    let baseURL = document.querySelector('#ejs-var-baseurl').value;

    // Save navigation button to a cookie
    await fetch(`${baseURL}/save_navigation`, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(error);
        });
}

async function NavigationCommand(el, index) {
    LoadingView(true);

    // Count the nav buttons
    // let navButtons = Array.from(document.querySelectorAll('.nav-button'));

    // // If a prior nav button was pressed, the nav buttons after have to be deleted
    // if (index + 1 < navButtons.length) {
    //     let finalNavButtons = navButtons.slice(0, index + 1);
    //     // Update the Nav Buttons
    //     UpdateNavBar(finalNavButtons);
    // }

    // If not, POST to the backend
    let queryObject = GetQueryObject();
    let values = {
        command: el.value,
        queryObject,
    };
    // Get base URL
    let baseURL = document.querySelector('#ejs-var-baseurl').value;

    // webinterface/command
    let fetchResponse = await fetch(`${baseURL}/command`, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('');
            console.log('FETCH ERROR');
            console.log(error);
        });

    ResponseHandler(fetchResponse);
    LoadingView(false);
}

// ==============
// EVENT HANDLER related functions
// ==============

function ResponseHandler(response) {
    let { status, data, message } = response;
    switch (status) {
        case 'success':
            SuccessHandler(data);
            break;
        case 'error':
            DisplaySweetAlertError(message);
            break;
        default:
            console.log(JSON.stringify(response));
            DisplaySweetAlertInfo('Unhandled response!');
    }
}

function SuccessHandler(data) {
    let { type } = data;
    switch (type) {
        case 'close':
            CloseWebview(data.isFacebook);
            break;
        case 'display':
            UpdateCardsAndMessages(data.messages, data.cards);
            break;
        case 'redirect':
            console.log('REDIRECTING');
            window.location.href = data.url;
            break;
        default:
            console.log(JSON.stringify(data));
            DisplaySweetAlertInfo('Unhandled success response!');
    }
}

function Debug(isLoading) {
    let intViewportHeight = window.innerHeight;
    alert(intViewportHeight);
    LoadingView(isLoading);
}
