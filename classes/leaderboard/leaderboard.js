const LeaderboardType = require("../../database/enum/leaderboardType");
const LeaderboardModel = require("../../database/game/leaderboard");
const SingleGameModel = require("../../database/game/singleGame");
const CountryModel = require("../../database/users/country");
const ObjectId = require('mongoose').Types.ObjectId;

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
     * @param {String} country Stato dal quale si vuole ottenere la classifica, id o codice
     */
    constructor(type, start, count, onlyMe, country) {
        this.type = type != null ? parseInt(type) : LeaderboardType.GLOBAL;
        this.start = start != null ? start : 0;
        this.count = count != null ? count : 100;
        this.onlyMe = onlyMe != null ? onlyMe : false;
        this.country = country != null ? country : null;
    }

    /**
     * Controlla che i filtri siano corretti
     */
    async validate(){
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
        // Controllo sul country
        if (this.type === LeaderboardType.LOCAL && this.country == null){
          throw "Country not passed";
        } else if (this.type !== LeaderboardType.LOCAL && this.country != null) {
            throw "Country is set with wrong type";
        } else if (this.type === LeaderboardType.LOCAL) {
            // Controlla che il country esista
            let query = {}
            try {
                query = {_id: new ObjectId(this.country)}
            } catch (err) {
                query = {code: this.country}
            }
            const countryDB = await CountryModel.findOne(query).lean().exec();
            if (countryDB == null) {
                throw "Country id or code not valid";
            }
            // Sostituisce al country l'id
            this.country = countryDB._id.toString();
        }
    }

    /**
     * Ottiene il campo find di mongoDB in base ai dati che ha
     */
    getFilter() {
        switch (this.type) {
            case LeaderboardType.GLOBAL: return {type: this.type};
            case LeaderboardType.LOCAL: return {type: this.type, country: this.country};
            default: throw "Query not supported";
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
        await filter.validate();
        // Ottiene la classifica
        if (!filter.onlyMe) {
            return await LeaderboardModel.find(filter.getFilter()).populate([
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
            {type: LeaderboardType.GLOBAL, func: updateGlobal},
            {type: LeaderboardType.LOCAL, func: updateLocal}
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
    let newLeaderboard = await SingleGameModel.find({record: true}).sort({points: -1}).populate('user').exec();
    await saveLeaderboard(currentLeaderboard, newLeaderboard, LeaderboardType.GLOBAL);
}

/**
 * Aggiorna la classifica locale in base al campo country degli utenti
 * @return {Promise<void>}
 */
async function updateLocal(){
    // Ottiene tutte le classifiche presenti in questo momento
    const allLeaderboards = await LeaderboardModel.find({type: LeaderboardType.LOCAL, country: {$ne: null}}).populate('country').exec();
    // Elimina tutte le classifiche locali presenti in questo momento
    await LeaderboardModel.deleteMany({type: LeaderboardType.LOCAL});
    // Classifica corrente divisa per stati
    const countryLeaderboards = leaderboardArrayToMatrix(allLeaderboards, null, (item, index) => {
        return {
            game_id: item.game._id.toString(),
            position: item.position
        }
    });
    // Ottiene tutte le partite degli utenti che hanno impostato uno stato
    let newLeaderboard = await SingleGameModel.find({record: true, 'user.country': {$eq: null}}).sort({points: -1}).populate([
        {
            path: 'user',
            populate: {
                path: 'country'
            }
        }
    ]).exec();
    // Divide la nuova classifica per stati
    const newCountryLeaderboards = leaderboardArrayToMatrix(newLeaderboard, 'user', (item, _) => {
        return item;
    });
    // Aggiorna le classifiche
    for (const key of Object.keys(newCountryLeaderboards)){
        // Se non esiste una classifica precedente prende un array vuoto
        const oldCountryLeaderboard = countryLeaderboards[key] != null ? countryLeaderboards[key] : [];
        // Aggiorna tutte le classifiche degli stati
        await saveLeaderboard(oldCountryLeaderboard, newCountryLeaderboards[key], LeaderboardType.LOCAL, key);
    }
}

/**
 * Converte un array di entrata (deve avere country come campo) in una matrice
 * @param array Array di entrata
 * @param {String | null} sub Indica che il campo country è un sotto elemento di quello passato
 * @param getElement Funzione per ottenere l'elemento da andare a inserite. Item e index vengono passati
 * @return {any[][]} Matrice creata
 */
function leaderboardArrayToMatrix(array, sub, getElement) {
    // Divide le classifiche in una matrice
    let data = [];
    for (let i = 0; i < array.length; i++){
        const item = array[i];
        if (sub != null && item[sub] == null){
            continue;
        }
        const key = sub != null ? item[sub].country._id.toString() : item.country._id.toString();
        if (data[key] == null) {
            data[key] = []
        }
        data[key].push(getElement(item, i));
    }
    return data;
}

/**
 * Effettua il salvataggio dei cambiamenti alla classifica
 * @param currentLeaderboard La classifica corrente
 * @param newLeaderboard La classifica da sostituire
 * @param {Number} type Il tipo di classifica
 * @param {String} country Il country a cui è riferita la classifica. Null per il globale e di default
 * @return {Promise<void>}
 */
async function saveLeaderboard(currentLeaderboard, newLeaderboard, type, country=null) {
    let userInserted = [];
    let reduce = 0;
    let toInsert = [];
    for (let index = 0; index < newLeaderboard.length; index++) {
        const item = newLeaderboard[index];
        const previousPosition = currentLeaderboard.findIndex(prevLead => prevLead.game_id === item._id.toString());
        // Se l'utente è stato eliminato non viene messo in classifica
        if (item.user == null) {
            reduce += 1;
            continue;
        }
        // Controlla che l'utente non sia già stato inserito
        if (userInserted.includes(item.user._id.toString())){
            reduce += 1;
            continue;
        }
        // Crea la risposta
        const toRet = {
            game: item._id,
            type: type,
            country: country,
            position: index + 1 - reduce,
            prev_position: previousPosition === -1 ? null : currentLeaderboard[previousPosition].position
        }
        userInserted.push(item.user._id.toString());
        // Controlla se l'utente non abbia già un record
        if (type === LeaderboardType.GLOBAL && item.user.statistics.best_placement !== toRet.position) {
            item.user.statistics.best_placement = toRet.position;
            await item.user.save();
        }
        toInsert.push(toRet);
    }
    // Aggiorna la classifica
    await LeaderboardModel.insertMany(toInsert);
}

module.exports = {
    Leaderboard,
    LeaderboardFilters
}
