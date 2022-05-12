let express = require('express');
let app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const helmet = require("helmet");
const morgan = require('morgan');
const {MongoDBUser, MongoDBPassword} = require('./config');

//Connessione a MongoDB
mongoose.connect(
    `mongodb+srv://${MongoDBUser}:${MongoDBPassword}@freecluster.xj48j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    function (error) {
        console.log(error != null ? `DB connection error: ${error.message}` : 'Connected to the MongoDB');
    });

//ROUTING
const index = require("./routes/index.js");

//Migliora la sicurezza
app.use(helmet());
//Fa il log di tutte le richieste
app.use(morgan('combined'))
//Configurazione per il body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//FRONTEND di produzione
app.use("/", express.static("www"));
//BACKEND
app.use("/api", index);

app.listen(process.env.PORT || 3000, function() {
    console.log('Server running on port ', 3000);
});
