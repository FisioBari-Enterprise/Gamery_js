const {Schema, model} = require("mongoose");

const passwordReset = new Schema({
    token: {type: String},
    active: {type: Boolean, default: true},
}, { timestamps: true });

module.exports = model("passwordReset", passwordReset);
