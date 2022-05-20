let express = require("express");
const StaticFunctions = require("../static");
const { saveWords } = require('../classes/game/words');
const Token = require("../classes/token");
const SingleGameDB = require('../database/game/singleGame');
const SingleGame = require("../classes/game/singleGame");
let router = express.Router();

/**
 * @swagger
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
 * @swagger
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
   const doc = await SingleGameDB.findOne().sort('-createdAt').lean().exec();
   if (doc === null) {
       return StaticFunctions.sendError(res, 'No game found');
   }
   StaticFunctions.sendSuccess(res, doc);
});

/**
 * @swagger
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
   } catch (error) {
       return StaticFunctions.sendError(res, error);
   }
   return StaticFunctions.sendSuccess(res, newGame.game, 201);
});

/**
 * @swagger
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
   let response = null;
   try {
       await game.build(true);
       response = await game.getRound(game.game.max_round, true);
   } catch (error) {
       return StaticFunctions.sendError(res, error);
   }
   return StaticFunctions.sendSuccess(res, response);
});

/**
 * @swagger
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
       return StaticFunctions.sendError(res, error);
   }
   return StaticFunctions.sendSuccess(res, response, 201);
});

/**
 * @swagger
 * \api\game\round:
 *  post:
 *      description: Lista di un terminato round
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
        return StaticFunctions.sendError(res, error);
    }
});

router.put('/round', Token.autenticateUser, async function (req, res) {
    let game = new SingleGame(req.user);
    try {
        await game.build(true);
        await game.checkRound(req.body.words, req.body.gameTime);
        // Invia la risposta
        if(game.game.completed) {
            return StaticFunctions.sendSuccess(res, {game: game.game});
        }
        const newRound = await game.getRound(game.game.max_round, true);
        return StaticFunctions.sendSuccess(res, newRound);
    }
    catch (error) {
        console.log(error);
        return StaticFunctions.sendError(res, error);
    }
})

module.exports = router
