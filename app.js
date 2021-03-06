let express = require('express');
let app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const helmet = require("helmet");
const morgan = require('morgan');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require('swagger-jsdoc');
const {MongoDBUser, MongoDBPassword, Database} = require('./config');
const StaticFunctions = require("./static");
const routeValidator = require("./classes/routeValidator");
const fs = require("fs");
//ROUTING importing
const index = require("./routes/index.js");
const user = require("./routes/client.js");
const game = require("./routes/game.js");
const country = require("./routes/country.js");
const leaderboard = require("./routes/leaderboard.js");

//Connessione a MongoDB
mongoose.connect(
    `mongodb+srv://${MongoDBUser}:${MongoDBPassword}@freecluster.xj48j.mongodb.net/${Database}?retryWrites=true&w=majority`,
    function (error) {
        console.log(error != null ? `DB connection error: ${error.message}` : 'Connected to MongoDB');
    }
);

// Opzioni della documentazione
let definition;
try {
    definition = JSON.parse(fs.readFileSync('./json/apiDefinition.json', 'utf8'));
} catch (error) {
    console.log("Errore nel json di definizione delle api docs");
    definition = {}
}
const swaggerOptions = {
    definition: definition,
    apis: ['./routes/*.js'],
};
//End point per la documentazione
const swaggerDocument = swaggerJsDoc(swaggerOptions);
// Salva su file la documentazione la documentazione
try {
    //fs.writeFileSync('./json/apiDocProduction.json', JSON.stringify(swaggerDocument, null, 4))
} catch (error) {
    console.log('Impossibile salvare su file')
}
// console.log(JSON.stringify(swaggerDocument));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, {
    explorer: true
}));

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
app.use("/api/country", country);
app.use("/api/leaderboard", leaderboard);
//Errore se non trova endpoint validi
app.use(routeValidator, function(req, res, next) {
    return StaticFunctions.sendError(res, 'Url or method not valid');
});

module.exports = app;
