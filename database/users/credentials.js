const {Schema, model, Types} = require("mongoose");
const TokenType = require("../enum/tokenType");

const credentials = new Schema({
    user: { type: Types.ObjectId, ref: 'users' },
    email: String,
    password: String,
    confirm: {type: Boolean, default: false},
    token: {
        value: {type: String, default: null},
        type: {type: Number, default: TokenType.CONFIRM_EMAIL},
        active: {type: Boolean, default: true}
    }
}, { timestamps: true })

module.exports = model("credentials", credentials);
