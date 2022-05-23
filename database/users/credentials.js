const {Schema, model, Types} = require("mongoose");

const credentials = new Schema({
    email: String,
    password: String,
    user: { type: Types.ObjectId, ref: 'users' }
}, { timestamps: true })

module.exports = model("credentials", credentials);
