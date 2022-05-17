const {Schema, model} = require("mongoose");

const word = new Schema({
    it: String,
    it_length: Number,
    en: String,
    en_length: Number,
}, { timestamps: true });

module.exports = model("words", word);
