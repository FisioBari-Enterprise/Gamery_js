const {Schema, model, Types} = require("mongoose");
const LeaderboardType = require("../enum/leaderboardType");

const leaderboard = new Schema({
    game: { type: Types.ObjectId, ref: 'singleGames' },
    type: { type: Number, default: LeaderboardType.GLOBAL },
    // Stato selezionato
    country: { type: Types.ObjectId, ref: 'country', default: null},
    position: { type: Number },
    prev_position: { type: Number, default: null }
}, { timestamps: true });

module.exports = model("leaderboard", leaderboard);
