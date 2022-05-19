const {Schema, model, Types} = require("mongoose");

const gameRound = new Schema({
    word: { type: Types.ObjectId, ref: 'words' },
    word_usage: { type: Number, default: 1 },
    game: { type: Types.ObjectId, ref: 'singlegames' },
    round: { type: Number, default: 0},
    word_insert: { type: String, default: null},
    correct: { type: Boolean, default: false},
    points: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = model("gameRounds", gameRound);
