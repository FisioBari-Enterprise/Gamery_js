const {Port} = require('./config');
const app = require("./app");

app.listen(Port | 3000, () => {
    console.log("Server listening on port " + (Port | 3000));

});
