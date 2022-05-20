const {Schema, model} = require("mongoose");

const user = new Schema({
    username: String,
    active: {type: Boolean, default: true},
    uuid: String,
}, { timestamps: true });

module.exports = model("users", user);
