const {Schema, model, Types} = require("mongoose");

const gameRound = new Schema({
    game: { type: Types.ObjectId, ref: 'singlegames' },
    round: { type: Number, default: 0},
    points: { type: Number, default: 0 },
    complete: { type: Boolean, default: false },
    words: [{
        word: {type: Types.ObjectId, ref: 'words'},
        word_insert: {type: String, default: null},
        correct: {type: Boolean, default: null},
        points: {type: Number, default: 0}
    }]
}, { timestamps: true });

module.exports = model("gameRounds", gameRound);
