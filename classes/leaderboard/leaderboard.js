const LeaderboardType = require("../../database/enum/leaderboardType");
const LeaderboardModel = require("../../database/game/leaderboard");
const SingleGameModel = require("../../database/game/singleGame");

/**
 * Filtri che si possono applicare alla leaderboard nella richiesta
 */
class LeaderboardFilters {
    constructor() {

    }
}

/**
 * Classe per la gestione della classifica
 */
class Leaderboard {
    /**Indica se la classifica è in fase di aggiornamento*/
    static updateMode = false;

    constructor() {

    }

    /**
     * Ottiene la classifica con dei filtri applicati
     */
    getFilteredLeaderboard() {
        if (Leaderboard.updateMode) {
            throw "Leaderboard is being updated. Please try again in a few moments";
        }
    }

    /**
     * Aggiorna la classifica
     * @param {Boolean} all Indica se aggiornare tutti i tipi di classifica
     * @param {Number[]} types Con all a false vengono elaborati solo alcune classifiche
     */
    static async update(all=true, types=[]) {
        Leaderboard.updateMode = true;
        const mapping = [
            {type: LeaderboardType.GLOBAL, func: updateGlobal}
        ]
        // Esegue gli aggiornamenti
        for (const map of mapping) {
            if (all || types.includes(map.type)) {
                await map.func();
            }
        }
        Leaderboard.updateMode = false;
    }
}

/**
 * Aggiorna la classifica globale
 */
async function updateGlobal() {
    // Ottiene la classifica corrente
    let currentLeaderboard = await LeaderboardModel.find({type: LeaderboardType.GLOBAL}).populate('game').lean().exec();
    currentLeaderboard = currentLeaderboard.map(item => {
        return {
            game_id: item.game._id.toString(),
            position: item.position
        }
    })
    // Elimina la classifica globale corrente
    await LeaderboardModel.deleteMany({type: LeaderboardType.GLOBAL});
    // Genera la nuova classifica
    let recordGames = await SingleGameModel.find({record: true}).sort({points: -1}).lean().exec();
    // Mappa le partite in modo da fare un insert many
    let userInserted = []
    let reduce = 0;
    recordGames = recordGames.map((item, index) => {
        const previousPosition = currentLeaderboard.findIndex(prevLead => prevLead.game_id === item._id.toString());
        // Controlla che l'utente non sia già stato inserito
        if (userInserted.includes(item.user)){
            reduce += 1;
            return;
        }
        // Crea la risposta
        const toRet = {
            game: item._id,
            type: LeaderboardType.GLOBAL,
            position: index + 1 - reduce,
            prev_position: previousPosition === -1 ? null : currentLeaderboard[previousPosition].position
        }
        userInserted.push(item.user);
        return toRet;
    })
    // Aggiorna la classifica
    await LeaderboardModel.insertMany(recordGames);
}

module.exports = {
    Leaderboard,
    LeaderboardFilters
}
