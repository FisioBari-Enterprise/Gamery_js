let express = require("express");
const StaticFunctions = require("../static");
const { saveWords } = require('../classes/game/words');
const Token = require("../classes/token");
const SingleGame = require("../classes/game/singleGame");
let router = express.Router();

/**
 * @openapi
 * \api\game\word\:
 *  post:
 *      description: Aggiunge le parole al DB (solo LOCALHOST)
 *      tags: [Word]
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: words
 *            description: All words
 *            in: formData
 *            required: true
 *            type: object
 *      responses:
 *          200:
 *              description: Tutto salvato correttamente
 *          403:
 *              description: Accesso non consentito
 */
router.post('/word', function (req, res, next) {
    if (req.socket.remoteAddress !== "::1") {
        return StaticFunctions.sendError(res, 'This ip haven\'t the access to the endpoint', 403);
    }
    next();
}, async function (req, res) {
    return await saveWords(res, req.body.words);
});

/**
 * @openapi
 * \api\game\:
 *  get:
 *      description: Ottiene l'ultima partita creata
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: L'istanza del gioco
 *          400:
 *              description: Istanza non trovata
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('', Token.autenticateUser, async function (req, res) {
    let game = new SingleGame(req.user);
    try {
        await game.build(true);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
   StaticFunctions.sendSuccess(res, {game: game.game});
});

/**
 * @openapi
 * \api\game\:
 *  post:
 *      description: Genera una nuova partita
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: L'istanza del gioco
 *          400:
 *              description: Ha già una partita attiva
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.post('', Token.autenticateUser, async function (req, res) {
   let newGame = new SingleGame(req.user);
   try {
       await newGame.createNewGame();
       await newGame.generateNewRound();
       let response = await newGame.getRound(newGame.game.max_round, true);
       return StaticFunctions.sendSuccess(res, response);
   } catch (error) {
       return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
   }
});

/**
 * @openapi
 * \api\game\round:
 *  post:
 *      description: Lista dell'ultimo round dell'ultima partita generata
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Lista dei round
 *          400:
 *              description: Errore riscontrato in fase di creazione
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('/round', Token.autenticateUser, async function (req, res) {
   let game = new SingleGame(req.user);
   try {
       await game.build(true);
       let response = await game.getRound(game.game.max_round, true);
       return StaticFunctions.sendSuccess(res, response);
   } catch (error) {
       console.log(error);
       return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
   }
});

/**
 * @openapi
 * \api\game\round:
 *  post:
 *      description: Genera un nuovo round per l'ultima partita generata dall'utente
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Lista dei round
 *          400:
 *              description: Errore riscontrato in fase di creazione
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.post('/round', Token.autenticateUser, async function (req, res) {
   let game = new SingleGame(req.user);
   let response = null;
   try {
       await game.build(true);
       await game.generateNewRound();
       response = await game.getRound(game.game.max_round, true);
   } catch (error) {
       console.log(error);
       return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
   }
   return StaticFunctions.sendSuccess(res, response, 201);
});

/**
 * @openapi
 * \api\game\round:
 *  get:
 *      description: informazioni di un terminato round
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Lista dei round
 *          400:
 *              description: Errore riscontrato in fase di creazione
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('/round/:id', Token.autenticateUser, async function (req, res) {
    let game = new SingleGame(req.user);
    try {
        await game.build(true);
        const response = await game.getRound(req.params.id, true);
        return StaticFunctions.sendSuccess(res, response);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * \api\game\round:
 *  put:
 *      description: Controllo su parole inserite al termine del round
 *      tags: [Game]
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: words
 *            description: Lista delle parole inserite dall'utente
 *            in: formData
 *            required: true
 *            type: array
 *            items:
 *              type: string
 *          - name : gameTime
 *            description: Tempo impiegato nel round in secondi
 *            in: formData
 *            required: true
 *            type: number
 *      responses:
 *          200:
 *              description: Informazioni sulla partita in corso
 *          400:
 *              description: Errore riscontrato in fase di update
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.put('/round', Token.autenticateUser, async function (req, res) {
    let game = new SingleGame(req.user);
    try {
        await game.build(true);
        await game.checkRound(req.body.words, req.body.gameTime);
        // Invia la risposta
        if(game.game.complete) {
            return StaticFunctions.sendSuccess(res, {game: game.game});
        }
        const newRound = await game.getRound(game.game.max_round, true);
        return StaticFunctions.sendSuccess(res, newRound);
    }
    catch (error) {
        console.log(error);
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

module.exports = router
