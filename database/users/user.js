const {Schema, model} = require("mongoose");

const user = new Schema({
    username: String,
    uuid: String,
}, { timestamps: true });

module.exports = model("users", user);
