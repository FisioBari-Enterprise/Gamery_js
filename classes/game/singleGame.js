import {generateNewRound} from "./words";
const GameRound = require("../../database/game/gameRound");
const SingleGameDB = require("../../database/game/singleGame");

/**
 * Classe per la gestione di una partita in singolo
 */
export class SingleGame {
    /**
     * Costruttore per la costruzione
     * @param { * } user L'utente che ha effettuato la richiesta
     * @param { String | null } id Id della partita di riferimento. Con null si può creare una nuova partita
     */
    async constructor(user, id=null) {
        this.id = id;
        this.user = user;
        //Ottiene l'istanza del gioco
        this.game = null;
        if (this.id !== null) {
            this.game = await SingleGameDB.findOne({_id: this.id}).exec();
            if (this.game === null) {
                throw "Id partita non valido";
            }
        }
    }

    /**
     * Controlla che siano presenti le informazioni della partita
     * @return {boolean} Risultato del controllo
     */
    checkData() {
        return this.id !== null && this.game !== null && this.user !== null
    }

    /**
     * Crea una nuova partita
     * @return {Promise<void>}
     */
    async createNewGame() {
        if (!this.checkData()) {
            throw "E' già presente un'istanza di una partita"
        }
        //Controllo che non ci sia già una partita attiva
        let game = await SingleGameDB.findOne({complete: false}).exec();
        if (game !== null) {
            throw "Hai già una partita iniziata"
        }
        //Genera la nuova partita
        this.game = new SingleGameDB({ user: this.user._id });
        await this.game.save();
        this.id = this.game._id;
    }

    /**
     * Genera un nuovo round
     * @throws {String} Errore durante la creazione
     * @return {Promise<void>}
     */
    async generateNewRound() {
        await generateNewRound(this.game);
    }

    /**
     * Ottiene le parole presenti in un determinato round
     * @param {number} round Numero del round. Con -1 li prende tutti
     * @return {Promise<void>}
     */
    async getRound(round=-1) {

    }
}
