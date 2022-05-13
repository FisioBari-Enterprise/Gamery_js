const {Schema, model} = require("mongoose");

const user = new Schema({
    username: String,
    email: String,
    password: String,
    uuid: String,
}, { timestamps: true });

module.exports = model("users", user);
