const {Schema, model, Types} = require("mongoose");
const LeaderboardType = require("../enum/leaderboardType");

const leaderboard = new Schema({
    game: { type: Types.ObjectId, ref: 'singlegame' },
    type: {type: Number, default: LeaderboardType.GLOBAL},
    position: {type: Number},
    prev_position: {type: Number, default: null}
}, { timestamps: true });

module.exports = model("leaderboard", leaderboard);
