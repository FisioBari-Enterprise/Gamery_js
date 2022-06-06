const {Schema, model, Types} = require("mongoose");

const country = new Schema({
    code: {type: String},
    name: {type: String}
}, { timestamps: true });

module.exports = model("country", country);
