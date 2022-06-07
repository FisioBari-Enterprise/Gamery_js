let express = require("express");
const StaticFunctions = require("../static");
const { saveWords } = require('../classes/game/words');
const Token = require("../classes/token");
const SingleGame = require("../classes/game/singleGame");
const UserValidator = require("../classes/users/validator/userValidator");
const User = require("../classes/users/user");
let router = express.Router();

// Carica le parole
router.post('/word', UserValidator.onlyLocalHost, async function (req, res) {
    return await saveWords(res, req.body.words);
});

/**
 * @openapi
 * /api/game/:
 *  get:
 *      description: Ottiene l'ultima partita creata
 *      tags: [Game]
 *      
 *      responses:
 *          200:
 *              description: L'istanza del gioco
 *              content:
 *                  application/json:
 *                      $ref: '#/components/responses/game/game'
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
 * /api/game/:
 *  post:
 *      description: Genera una nuova partita
 *      tags: [Game]
 *      
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
 * /api/game/round:
 *  post:
 *      description: Lista dell'ultimo round dell'ultima partita generata
 *      tags: [Game]
 *      
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
 * /api/game/round:
 *  post:
 *      description: Genera un nuovo round per l'ultima partita generata dall'utente
 *      tags: [Game]
 *      
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
 * /api/game/round:
 *  get:
 *      description: informazioni di un terminato round
 *      tags: [Game]
 *      
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
 * /api/game/round:
 *  put:
 *      description: Controllo su parole inserite al termine del round
 *      tags: [Game]
 *      
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
        const newRound = await game.getRound(game.game.max_round, true);
        return StaticFunctions.sendSuccess(res, newRound);
    }
    catch (error) {
        console.log(error);
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

/**
 * @openapi
 * /api/game/recent:
 *  put:
 *      description: Ottengo le ultime partite dell'utente
 *      tags: [Statistics]
 *      
 *      parameters:
 *      responses:
 *          200:
 *              description: Ultime partite dell'utente
 *          400:
 *              description: Errore riscontrato in fase di update
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('/recent', Token.autenticateUser, async function(req ,res){
    let user = new User(req.user._id)
    await user.buildUser()
    try{
        let games = await user.getGames(50);

        return StaticFunctions.sendSuccess(res,games);
    }
    catch (error){
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

/**
 * @openapi
 * /api/game/{id}/rounds:
 *  get:
 *      description: Ottengo i round per una specifica partita
 *      tags: [Statistics]
 *      
 *      parameters:
 *      responses:
 *          200:
 *              description: Elenco dei round per la partita
 *          400:
 *              description: Errore riscontrato in fase di update
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('/:id/rounds', Token.autenticateUser, async function(req, res){
    let user = new User(req.user._id);
    try {
        await user.buildUser();

        let roundGames = await user.getGameRounds(req.params.id);

        return StaticFunctions.sendSuccess(res, roundGames);
    }
    catch (error){
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

/**
 * @openapi
 * /api/game/{id}/round/{number}:
 *  get:
 *      description: Ottengo il round indicato per una specifica partita
 *      tags: [Statistics]
 *      
 *      responses:
 *          200:
 *              description: Round della partita richiesto
 *          400:
 *              description: Errore riscontrato in fase di update
 *          401:
 *              description: Token non passato
 *          403:
 *              description: Sessione o token non validi
 */
router.get('/:id/round/:number', Token.autenticateUser, async function(req, res){
    let user = new User(req.user._id);
    try {
        await user.buildUser();

        let round = await user.getGameRound(req.params.id, req.params.number);
        return StaticFunctions.sendSuccess(res, round);
    }
    catch (error){
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

module.exports = router
