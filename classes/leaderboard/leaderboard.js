const LeaderboardType = require("../../database/enum/leaderboardType");
const LeaderboardModel = require("../../database/game/leaderboard");
const SingleGameModel = require("../../database/game/singleGame");

/**
 * Filtri che si possono applicare alla leaderboard nella richiesta
 */
class LeaderboardFilters {
    /**
     * Crea i filtri
     * @param {Number} type Tipo di classifica
     * @param {Number} start Indice d'inizio della ricerca
     * @param {Number} count Numero degli elementi richiesti
     * @param {Boolean} onlyMe Indica se prendere solo l'utente del token
     */
    constructor(type, start, count, onlyMe) {
        this.type = type != null ? type : LeaderboardType.GLOBAL;
        this.start = start != null ? start : 0;
        this.count = count != null ? count : 100;
        this.onlyMe = onlyMe != null ? onlyMe : false;
    }

    /**
     * Controlla che i filtri siano corretti
     */
    validate(){
        // Controllo del tipo
        if (!LeaderboardType.all().includes(this.type)) {
            throw "Type not valid"
        }
        // Controllo sul punto di partenza
        if (this.start < 0) {
            throw "Start point not valid"
        }
        // Controllo sul numero di elementi
        if (this.count <= 0 || this.count > 100) {
            throw "Count value not valid. Max value: 100"
        }
    }
}

/**
 * Classe per la gestione della classifica
 */
class Leaderboard {
    /**Indica se la classifica è in fase di aggiornamento*/
    static updateMode = false;

    /**
     *
     * @param user L'utente connesso al token
     */
    constructor(user) {
        this.user = user
    }

    /**
     * Ottiene la classifica con dei filtri applicati
     * @param {LeaderboardFilters} filter Filtri da applicare alla query
     */
    async getFilteredLeaderboard(filter) {
        if (Leaderboard.updateMode) {
            throw "Leaderboard is being updated. Please try again in a few moments";
        }
        // Controlla che i filtri siano stati inviati in maniera corretta
        filter.validate();
        // Ottiene la classifica
        if (!filter.onlyMe) {
            return await LeaderboardModel.find({type: filter.type}).populate([
                {
                    path: 'game',
                    populate: {
                        path: 'user',
                        select: 'username'
                    }
                }
            ]).sort({points: -1})
                .skip(filter.start).limit(filter.count).lean().exec();
        }
        // Prende la posizione in classifica solo dell'utente del token
        return await LeaderboardModel.findOne({
            'game.user': this.user._id.toString()
        }).lean().exec();
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
