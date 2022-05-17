let GameRound = require("../../database/game/gameRound");
let SingleGameDB = require("../../database/game/singleGame");
let Word = require("../../database/game/word");

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
     * Crea una nuova partita
     */
    async createNewGame() {
        if (this.id !== null) {
            throw "Id partita già presente";
        }
        //Controllo che non ci sia già una partita attiva
        let game = await SingleGameDB.findOne({complete: false}).exec();
        if (game !== null) {
            throw "Hai già una partita iniziata"
        }
        //Genera la nuova partita
        let newGame = new SingleGameDB({})
    }
}
