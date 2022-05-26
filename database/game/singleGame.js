const {Schema, model, Types} = require("mongoose");
const Languages = require('../enum/languages');

const singleGames = new Schema({
    user: { type: Types.ObjectId, ref: 'users' },
    language: { type: Number, default: Languages.EN },
    game_time: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    record: { type: Boolean, default: false },
    max_round: { type: Number, default: 0 },
    remaining_pause: { type: Number, default: 3 },
    memorize_time_for_round: { type: Number, default: 0 },
    writing_time_for_round: { type: Number, default: 0 },
    complete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model("singleGames", singleGames);
