const express = require('express');
const router = express.Router();

let addressinfo = [
    {
        get_address_info: [
            {
                field: 'HOUSE_FLOOR_UNIT',
                label: 'House/Floor/Unit No.',
                value: null,
            },
            {
                field: 'BUILDING',
                label: 'Building Name',
                value: null,
            },
            {
                field: 'STREET',
                label: 'Street Name',
                value: null,
            },
            {
                field: 'INSTRUCTION',
                label: 'Landmark/Instructions',
                value: null,
            },
        ],
    },
];

let queryvalue = {
    userID: '2619933368105161',
    botID: '114228056672099',
    name: 'Alejo%20Kim%20Uy',
    convertedTime: '2021-08-30T07%3A51%3A25%2B08%3A00',
    country: 'PH',
    language: 'en',
    orderpreference: 'delivery',
    latitude: '14.556484',
    longitude: '121.023842',
    fb_iframe_origin: 'https://www.facebook.com',
};

const mapbuildermodule = require('../../modules/mapbuildermodule.js');

router.get('/', async function (req, res) {
    // Get the query object
    // Debug for now
    let queryObject = queryvalue;
    let userProfile = queryvalue;

    // Get the API key from the database
    let apikey = 'pk.617c1ae9f2ec8cf298af42fe5d420466';

    // Get the addressinfo from the database
    let addressInfoArray = addressinfo;

    // Build the addressinfo html
    let addressinfohtml =
        mapbuildermodule.GenerateAddressFields(addressInfoArray);

    res.render('pages/services/map_address_locationiq', {
        title: 'Submit Address',
        referenceLat: queryObject.latitude,
        referenceLong: queryObject.longitude,
        apikey,
        language: userProfile.language,
        addressinfoSection: addressinfohtml ? addressinfohtml : '',
    });
});

router.get('/file', function (req, res) {
    res.sendFile('public/webpages/locationiq.html', {
        root: ROOT_DIRECTORY,
    });
});
module.exports = {
    router: router,
};
