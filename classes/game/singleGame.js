const ObjectId = require('mongoose').Types.ObjectId;
const GameRound = require("../../database/game/gameRound");
const SingleGameDB = require("../../database/game/singleGame");
const Words = require("../../database/game/word");
const Languages = require("../../database/enum/languages")

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
        let game = await SingleGameDB.findOne({ complete: false, user: new ObjectId(this.user._id)}).exec();
        if (game !== null) {
            throw "You have to complete your last game before creation of another game"
        }
        //Genera la nuova partita
        this.game = new SingleGameDB({ user: this.user._id, language: this.user.preferences.language });
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
        const roundData = await GameRound.findOne({game: new ObjectId(this.id), round: round}).populate('game').populate('words.word').lean().exec();
        if (roundData == null) {
            throw "Number of round not valid";
        }
        if (!serialize) {
            return roundData
        }
        const wordFields = Languages.getWordFields(this.game.language);
        roundData.words = roundData.words.map(item => {
            if (item.word !== null) {
                item.word = item.word[wordFields[0]]
            }
            return item
        })
        return roundData
    }

    /**
     * Controllo se ho passato il round in base alle parole inserite dall'utente
     * @param {String[]} words parole inserite dall'utente
     * @param {number} gameTime tempo impiegato nel round in secondi
     * @returns {Promise<void>}
     */
    async checkRound(words, gameTime){
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
        // inserisco spazio unico tra le parole
        for(let i = 0; i < words.length; i++){
            words[i] = words[i].replace(/ +(?= )/g, ' ');
        }

        //Controllo delle parole inserite
        let roundData  = await GameRound.findOne({game: new ObjectId(this.id), round: this.game.max_round}).populate('words.word').exec();
        if(roundData == null){
            throw "Round information not found"
        }
        //Ciclo per tutte le parole del round in modo da vedere quali sono state inserite correttamente
        const wordFields = Languages.getWordFields(this.game.language)
        let wrongWords = [];
        for(let j = 0; j < words.length; j++){
            let found = false;
            // Loop su tutte le parole del round per cercare una corrispondenza
            for(let i = 0; i < roundData.words.length && !found; i++){
                const wordRound = roundData.words[i].word[wordFields[0]];
                const wordRoundLength = roundData.words[i].word[wordFields[1]];
                if(wordRound === words[j]){
                    // Parola corretta
                    this.game.points += wordRoundLength;
                    roundData.points += wordRoundLength;
                    roundData.words[i].points = wordRoundLength;
                    roundData.words[i].correct = true;
                    roundData.words[i].word_insert = words[j];
                    found = true;
                }
            }
            // Se non ha trovato la parola la aggiunge come errore
            if (!found) {
                wrongWords.push(words[j]);
            }
        }
        // Salva le parole sbagliate
        for(const wrong of wrongWords) {
            roundData.words.push({
                word: null,
                word_insert: wrong,
                correct: false,
                points: -1
            })
            // Toglie un punto per parola sbagliata
            this.game.points -= 1;
            roundData.points -= 1;
        }
        roundData.complete = true;
        // Salva i cambiamenti
        await roundData.save();

        this.game.game_time += gameTime;
        await this.game.save();
        // Controllo passaggio del round
        if (roundData.words.some(item => !item.correct && item.word != null)) {
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


/**
 * Genera un nuovo round in base alle parole che sono già state usate
 * @param { * } game Modello del gioco di riferimento
 * @return {Promise<void>}
 */
async function generateNewRound(game) {
    // Controllo conclusione della partita
    if (game.complete ) {
        throw "Game already completed";
    }
    // Controllo del non completamento dell'ultimo round. Se il round è a 0 non c'è il controllo
    if (game.max_round > 0){
        const rounds = await GameRound.findOne({game: new ObjectId(game._id), round: game.max_round, complete: true}).lean().exec();
        if (rounds === null) {
            throw "You haven't completed last round"
        }
    }

    //Ottengo le n parole da inserire all'interno del round
    const nWord = Math.trunc(((game.max_round / 3) + 1) * 4)
    const maxLength = Math.trunc(nWord / 4) * 6;
    // Imposta la query
    const wordFields = Languages.getWordFields(game.language);
    let query = {};
    query[wordFields[1]] = {$lte: maxLength};
    // Esegue la query
    let words = await Words.aggregate([
        {
            $match: query
        },
        { $sample: { size: nWord }}
    ]).exec();

    //Creazione round
    let round = new GameRound({
        game: game._id,
        round: game.max_round + 1,
        words: words.map((item) => {
            return {word: item._id};
        })
    })

    await round.save();

    // Aggiorna il campo round della partita
    game.max_round += 1;
    game.memorize_time_for_round = timeForRound(words, false);
    game.writing_time_for_round = timeForRound(words);
    await game.save();
}

/**
 * Ottiene il numero di secondi assegnati per inserire o ricordare le parole
 * @param {[*]} words Lista delle parole
 * @param {boolean} insert Indica se calcolare il tempo per l'inserimento o per la memorizzazione
 * @returns {number} Tempo calcolato
 */
function timeForRound(words, insert=true) {
    let tot = 0;
    for (const word of words) {
        if (word.en_length == null) {
            throw "Length not found for word " + word.en;
        }
        const base = insert ? 4 : 3;
        const molt = Math.trunc(word.en_length / 5) + 1;
        tot += base * molt;
    }
    return tot;
}
