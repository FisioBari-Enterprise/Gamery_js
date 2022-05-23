const {Schema, model, Types} = require("mongoose");

const session = new Schema({
    token: String,
    valid: Boolean,
    ipAddress: String,
    user: { type: Types.ObjectId, ref: 'users' }
}, { timestamps: true });

module.exports = model("sessions", session);
