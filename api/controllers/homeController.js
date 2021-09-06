const express = require('express');
const router = express.Router();

let addressinfo = [
    // {
    //     field: 'HOUSE_FLOOR_UNIT',
    //     label: 'House/Floor/Unit No.',
    //     value: null,
    // },
    // {
    //     field: 'BUILDING',
    //     label: 'Building Name',
    //     value: null,
    // },
    // {
    //     field: 'STREET',
    //     label: 'Street Name',
    //     value: null,
    // },
    // {
    //     field: 'INSTRUCTION',
    //     label: 'Landmark/Instructions',
    //     value: null,
    // },
];

let queryvalue = {
    userID: '2619933368105161',
    botID: '114228056672099',
    name: 'Alejo%20Kim%20Uy',
    convertedTime: '2021-08-30T07%3A51%3A25%2B08%3A00',
    country: 'PH',
    language: 'en',
    orderpreference: 'delivery',
    latitude: '14.343635864303874',
    longitude: '120.9315928175285',
    fb_iframe_origin: 'https://www.facebook.com',
};

const mapbuildermodule = require('../../modules/mapbuildermodule.js');

router.get('/', async function (req, res) {
    try {
        console.log('\n mapaddresslocationcontroller.GET_map');

        // Get the query object
        // Debug for now
        let queryObject = queryvalue;
        let userProfile = queryvalue;

        // Get the API key from the database
        let apikey = 'pk.617c1ae9f2ec8cf298af42fe5d420466';

        // Get the addressinfo from the database
        let addressInfoArray = addressinfo ? addressinfo : '';

        // Build the addressinfo html
        let addressinfohtml = '';
        if (queryObject.orderpreference.toLowerCase() === 'delivery') {
            addressinfohtml = await mapbuildermodule.GenerateAddressFields(
                addressInfoArray
            );
        }

        let addressinfoFlag = addressinfohtml ? true : false;

        // console.log(addressinfohtml);

        res.render('pages/services/map_address_locationiq', {
            title: 'Submit Address',
            referenceLat: queryObject.latitude,
            referenceLong: queryObject.longitude,
            apikey,
            addressinfoFlag,
            language: userProfile.language,
            addressinfoSection: addressinfohtml ? addressinfohtml : '',
        });
    } catch (e) {
        console.log('\n mapaddresslocationcontroller.GET_map ERROR');
        console.log(JSON.stringify(e));
        console.log(e);
        res.json({
            status: 'error',
            message: e.message,
        });
    }
});

router.post('/search', express.json(), async function (req, res) {
    try {
        console.log('\n mapaddresslocationcontroller.POST_search');

        // Get the query object
        // Debug for now
        let userProfile = queryvalue;

        // Get the body
        let { queryObject, apikey, searchTerm } = req.body;

        // let viewbox = `<max_lon>,<max_lat>,<min_lon>,<min_lat>`;

        // Get the places
        let suggestionshtml = await mapbuildermodule.PlacesAutoComplete({
            apikey,
            searchTerm,
        });

        // console.log(suggestionshtml);

        res.json({
            status: 'success',
            data: {
                html: suggestionshtml,
            },
        });
    } catch (e) {
        console.log('\n mapaddresslocationcontroller.POST_search ERROR');
        console.log(e);
        console.log(JSON.stringify(e));
        res.json({
            status: 'error',
            message: e.message,
        });
    }
});

router.post('/geocode', express.json(), async function (req, res) {
    try {
        console.log('\n mapaddresslocationcontroller.POST_search');

        // Get the query object
        // Debug for now
        let userProfile = queryvalue;

        // Get the body
        let { queryObject, apikey, lng, lat } = req.body;

        // let viewbox = `<max_lon>,<max_lat>,<min_lon>,<min_lat>`;

        // Get the details
        let info = await mapbuildermodule.ReverseGeocode({
            apikey,
            lng,
            lat,
        });

        // console.log(suggestionshtml);

        res.json({
            status: 'success',
            data: {
                info,
            },
        });
    } catch (e) {
        console.log('\n mapaddresslocationcontroller.POST_search ERROR');
        console.log(e);
        console.log(JSON.stringify(e));
        res.json({
            status: 'error',
            message: e.message,
        });
    }
});

router.post('/save', express.json(), async function (req, res) {
    try {
        console.log('\n mapaddresslocationcontroller.POST_save');

        let body = req.body;
        console.log(JSON.stringify(body));

        res.json({
            status: 'success',
        });
    } catch (e) {
        console.log('\n mapaddresslocationcontroller.POST_save ERROR');
        console.log(e);
        console.log(JSON.stringify(e));
        res.json({
            status: 'error',
            message: e.message,
        });
    }
});

router.get('/file', function (req, res) {
    res.sendFile('public/webpages/locationiq.html', {
        root: ROOT_DIRECTORY,
    });
});
module.exports = {
    router: router,
};
