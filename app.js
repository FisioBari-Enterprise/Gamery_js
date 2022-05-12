const PORT = process.env.PORT || 3000;
let express = require('express');
let app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

//Configura le env variables
dotenv.config();

//Connessione a MongoDB
mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@freecluster.xj48j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    function (error) {
        console.log(error != null ? `DB connection error: ${error.message}` : 'Connected to the MongoDB');
    });

//ROUTING
const index = require("./routes/index.js");

app.use(express.json()); //Used to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

//FRONTEND
app.use("/", express.static("www"));
//BACKEND
app.use("/api", index);

app.listen(PORT, function() {
    console.log('Server running on port ', 3000);
});
