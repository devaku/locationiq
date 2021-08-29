const express = require('express');
const router = express.Router();

router.get('/', async function (req, res) {
    res.render('home', {
        title: 'THIS IS A TITLE',
        message: 'THIS IS A MESSAGE',
    });
});

router.get('/file', function (req, res) {
    res.sendFile('public/webpages/closing.html', {
        root: ROOT_DIRECTORY,
    });
});
module.exports = {
    router: router,
};
