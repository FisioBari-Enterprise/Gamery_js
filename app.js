const PORT = process.env.PORT || 3000;
let express = require('express');
let app = express();
const mongoose = require("mongoose");

//Connessione a MongoDB
mongoose.connect(
    "mongodb+srv://gamery_js:mBoj8OwRU1cAqEoz@freecluster.xj48j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    function (error) {
        console.log("Connected to Trading database")
    });

//ROUTING
const index = require("./routes/index.js");

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

app.use("/", index);

app.listen(PORT, function() {
    console.log('Server running on port ', 3000);
});
