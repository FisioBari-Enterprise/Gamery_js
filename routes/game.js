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
    return await saveWords(res, req.body.words, 201);
});

/**
 * @openapi
 * /api/game/:
 *  get:
 *      description: Ottiene l'ultima partita creata
 *      tags: [Game]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *      security:
 *          - userAuth: []
 *      responses:
 *          201:
 *              $ref: '#/components/responses/game_round'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.post('', Token.autenticateUser, async function (req, res) {
   let newGame = new SingleGame(req.user);
   try {
       await newGame.createNewGame();
       await newGame.generateNewRound();
       let response = await newGame.getRound(newGame.game.max_round, true);
       return StaticFunctions.sendSuccess(res, response, 201);
   } catch (error) {
       return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
   }
});

/**
 * @openapi
 * /api/game/round:
 *  get:
 *      description: Lista dell'ultimo round dell'ultima partita generata
 *      tags: [Game]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game_round'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *      security:
 *          - userAuth: []
 *      responses:
 *          201:
 *              $ref: '#/components/responses/game_round'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 * /api/game/round/{id}:
 *  get:
 *      description: informazioni di un terminato round
 *      tags: [Game]
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: id
 *            description: Numero del round
 *            in: path
 *            required: true
 *            schema:
 *              type: number
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game_round'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *      security:
 *          - userAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/game_round'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game_round'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *  get:
 *      description: Ottengo le ultime partite dell'utente
 *      tags: [Statistics]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/recent_games'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: id
 *            description: Id della partita
 *            in: path
 *            required: true
 *            schema:
 *              type: number
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game_rounds'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: id
 *            description: Id della partita
 *            in: path
 *            required: true
 *            schema:
 *              type: number
 *          - name: number
 *            description: Numero del round
 *            in: path
 *            required: true
 *            schema:
 *              type: number
 *      responses:
 *          200:
 *              $ref: '#/components/responses/game_with_rounds'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
