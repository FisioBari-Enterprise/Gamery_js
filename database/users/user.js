const {Schema, model} = require("mongoose");
const Languages = require("../enum/languages");

const user = new Schema({
    username: String,
    uuid: String,
    active: {type: Boolean, default: true},
    // Statistiche dell'utente
    statistics: {
        game_time: {type: Number, default: 0},
        tot_games: {type: Number, default: 0},
        tot_points: {type: Number, default: 0},
        max_points: {type: Number, default: 0},
        best_placement: {type: Number, default: 0}
    },
    // Preferenze utente
    preferences: {
        language: {type: Number, default: Languages.EN},
        colors_icon: [{type: String}],
        orientation_icon: {type: Number, default: 0}
    },
    // Impostazioni utente
    settings: {
        font_size: {type: Number, default: 20},
        volume: {type: Number, default: 100},
        sound: {type: Boolean, default: true},
    }
}, { timestamps: true });

module.exports = model("users", user);
