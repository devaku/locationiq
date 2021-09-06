// Load Development Variables

const PORT = process.env.PORT ? process.env.PORT : '8080';

// Set the ROOT DIRECTORY
global.ROOT_DIRECTORY = __dirname;

const express = require('express');
const morgan = require('morgan');

//Logger
const routes = require('./routes/index.js');

const app = express();

//morgan logger
app.use(morgan('short'));

//Public folder
app.use(express.static('public'));

//Parse incoming JSON
app.use(
    express.urlencoded({
        extended: true,
    })
);

//Set routes
routes(app);

//Set ejs as view engine
app.set('view engine', 'ejs');
app.set('view options', {
    delimiter: '?',
});

app.set('port', PORT);
app.listen(PORT, () => {
    console.log(`Server is running at URL http://localhost:${PORT}`);
});
