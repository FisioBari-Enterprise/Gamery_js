const {Schema, model} = require("mongoose");

const credentials = new Schema({
    email: String,
    password: String
}, { timestamps: true })

module.exports = model("users", credentials);