const {Schema, model, Types} = require("mongoose");
const EmailType = require("../enum/emailType");

const email = new Schema({
    user: { type: Types.ObjectId, ref: 'users' },
    apiId: {type: String, default: null},
    type: {type: Number, default: EmailType.CONFIRM_EMAIL}
}, { timestamps: true })

module.exports = model("email", email);
