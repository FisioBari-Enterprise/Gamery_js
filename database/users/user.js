const {Schema, model} = require("mongoose");

const user = new Schema({
    username: String,
    uuid: String,
    active: {type: Boolean, default: true},
}, { timestamps: true });

module.exports = model("users", user);
