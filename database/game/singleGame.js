const {Schema, model, Types} = require("mongoose");

const singleGames = new Schema({
    user: { type: Types.ObjectId, ref: 'users' },
    rounds: [{ type: Types.ObjectId, ref: 'gameRounds' }],
    start: { type: Date, default: Date.now },
    end: { type: Date, default: null },
    game_time: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    record: { type: Boolean, default: false },
    max_round: { type: Number, default: 0 },
    remaining_pause: { type: Number, default: 3 },
    time_for_round: { type: Number, default: 0 },
    complete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model("singleGames", singleGames);
