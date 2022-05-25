let express = require('express');
let app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const helmet = require("helmet");
const morgan = require('morgan');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require('swagger-jsdoc');
const {MongoDBUser, MongoDBPassword} = require('./config');
const StaticFunctions = require("./static");

//Connessione a MongoDB
mongoose.connect(
    `mongodb+srv://${MongoDBUser}:${MongoDBPassword}@freecluster.xj48j.mongodb.net/Gamery?retryWrites=true&w=majority`,
    function (error) {
        console.log(error != null ? `DB connection error: ${error.message}` : 'Connected to MongoDB');
    }
);

// Opzioni della documentazione
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gamery js',
            version: '0.1',
        },
    },
    apis: ['./routes/*.js'],
};
//End point per la documentazione
const swaggerDocument = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//ROUTING
const index = require("./routes/index.js");
const user = require("./routes/client.js");
const game = require("./routes/game.js");

//Migliora la sicurezza
//app.use(helmet());
//Fa il log di tutte le richieste
app.use(morgan('combined'))
//Configurazione per il body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//FRONTEND di produzione
app.use("/", express.static("client"));
//BACKEND
app.use("/api", index);
app.use("/api/client", user);
app.use("/api/game", game);
//Errore se non trova endpoint validi
app.use(function(req, res, next) {
    StaticFunctions.sendError(res, 'Url or method not valid');
});

module.exports = app;
