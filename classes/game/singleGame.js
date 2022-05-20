const { generateNewRound, timeForRound } = require('./words');
const ObjectId = require('mongoose').Types.ObjectId;
const GameRound = require("../../database/game/gameRound");
const SingleGameDB = require("../../database/game/singleGame");
const Words = require("../../database/game/word");

/**
 * Classe per la gestione di una partita in singolo
 */
module.exports = class SingleGame {
    /**
     * Costruttore per la costruzione
     * @param { * } user L'utente che ha effettuato la richiesta
     * @param { String | null } id Id della partita di riferimento. Con null si può creare una nuova partita
     */
    constructor(user, id=null) {
        this.id = id;
        this.user = user;
        this.game = null;
    }

    /**
     * Cerca di costruire l'elemento
     * @param {boolean} last Indica la costruzione dell'ultima partita ignorando l'id nell'istanza corrente
     * @throws {String} Gioco non trovato
     * @return {Promise<void>}
     */
    async build(last=false) {
        if (last) {
            //Sostituisce l'id e il gioco con l'ultimo generato
            const lastGame = await SingleGameDB.find({user: this.user._id}).sort({createdAt: -1}).exec();
            if(lastGame.length === 0) {
                throw "No game found for this user";
            }
            this.game = lastGame[0];
            this.id = this.game._id;
        }
        if (this.id !== null && this.game === null) {
            this.game = await SingleGameDB.findOne({_id: new ObjectId(this.id)}).exec();
            if (this.game === null) {
                throw "Id partita non valido";
            }
        }
    }

    /**
     * Controlla che siano presenti le informazioni della partita
     * @return {boolean} Risultato del controllo
     */
    async checkData() {
        await this.build();
        return this.id !== null && this.game !== null && this.user !== null
    }

    /**
     * Crea una nuova partita
     * @throws {String} Errore durante la creazione
     * @return {Promise<void>}
     */
    async createNewGame() {
        if (!this.checkData()) {
            throw "Already exists a game instance"
        }
        //Controllo che non ci sia già una partita attiva
        let game = await SingleGameDB.findOne({complete: false}).exec();
        if (game !== null) {
            throw "You have to complete your last game before creation of another game"
        }
        //Genera la nuova partita
        this.game = new SingleGameDB({ user: this.user._id });
        await this.game.save();
        this.id = this.game._id;
    }

    /**
     * Genera un nuovo round
     * @throws {String} Errore durante la creazione del nuovo round
     * @return {Promise<void>}
     */
    async generateNewRound() {
        await generateNewRound(this.game);
    }

    /**
     * Ottiene le parole presenti in un determinato round
     * @param {number | string} round Numero del round
     * @param {boolean} serialize Indica se bisogna serializzare i dati per la risposta
     * @param {boolean} complete Se il serialize è a true ritorna tutti i dati delle parole nel round
     * @return {LeanDocument[]} Tutti i round trovati
     */
    async getRound(round, serialize=false, complete=false) {
        if (!this.checkData()) {
            throw "Game instance not found";
        }
        if (round < 1 || round > this.game.max_round) {
            throw "Number of round not valid";
        }
        const roundData = await GameRound.find({game: new ObjectId(this.id), round: round}).populate('word').lean().exec();
        if (!serialize) {
            return roundData
        }
        const allWords = roundData.map(item => item.word);
        return {
            'game': this.game,
            'round': typeof round === 'string' ? parseInt(round) : round,
            'words': complete ? allWords : allWords.map(word => word.en)
        }
    }

    /**
     * Controllo se ho passato il round in base alle parole inserite dall'utente
     * @param {String[]} words parole inserite dall'utente 
     * @param {number} gameTime tempo impiegato nel round in secondi
     * @returns {Promise<void>}
     */
    async checkRound(words, gameTime){
        console.log(words);
        //Controllo dati partita
        if (!this.checkData()) {
            throw "Game instance not found";
        }
        if (this.game.complete) {
            throw "Game already completed";
        }
        //Controllo sugli input
        if(words == null || gameTime == null){
            throw "Body error"
        }
        if(Object.prototype.toString.call(words) !== '[object Array]' || typeof gameTime !== 'number') {
            throw "Variable type not valid";
        }
        //rimuovo spazi multipli all'inizio e alla fine della parole e inserisco spazio unico tra le parole
        for(let i = 0; i < words.length; i++){
            words[i] = words[i].replace(/^\s+|\s+$/g, '').replace(/ +(?= )/g, ' ');
        }
        //Controllo delle parole inserite
        let roundData  = await GameRound.find({game: new ObjectId(this.id), round: this.game.max_round}).populate('word').exec();
        if(roundData.length === 0){
            throw "Round information not found"
        }
        //Ciclo per tutte le parole del round in modo da vedere quali sono state inserite corretamente
        for(let i = 0; i < roundData.length; i++){
            for(let j = 0; j < words.length; j++){
                if(roundData[i].word.en === words[j]){
                    this.game.points += roundData[i].word.en_length;
                    roundData[i].points = roundData[i].word.en_length;
                    roundData[i].correct = true;
                    roundData[i].word_insert = words[j];
                    await roundData[i].save();
                    break;
                } 
            }
        }
        this.game.game_time += gameTime;
        await this.game.save();
        // Controllo passaggio del round
        if (roundData.some(item => !item.correct)) {
            //Caso round non passato
            await elaborateLose(this.game);
        } else {
            //se passo il round genero il round successivo
            await this.generateNewRound();
        }
    }
}

/**
 * Aggiorna i dati della partita in caso di sconfitta
 * @param {*} game Partita da aggiornare
 */
async function elaborateLose(game) {
    game.complete = true;
    // Controllo se ha raggiunto il punteggio massimo
    const currentRecord = await SingleGameDB.find({user: game.user}).sort({points: -1}).limit(1).lean().exec();
    if (currentRecord.length === 0 || currentRecord[0]._id === game._id) {
        game.record = true;
    }
    await game.save();
}
