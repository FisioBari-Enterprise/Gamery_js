let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const {Leaderboard, LeaderboardFilters} = require("../classes/leaderboard/leaderboard");
const LeaderboardType = require("../database/enum/leaderboardType");
const Token = require("../classes/token");

/**
 * @openapi
 * /api/leaderboard:
 *  get:
 *      description: Ottiene la classifica con i filtri applicati
 *      tags: [Leaderboard]
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: type
 *            description: Tipo di classifica
 *            in: query
 *            required: false
 *            schema:
 *              type: number
 *          - name: start
 *            description: Indice della posizione di inizio
 *            in: query
 *            required: false
 *            schema:
 *              type: number
 *          - name: count
 *            description: Numero di elementi richiesti. Max = 100
 *            in: query
 *            required: false
 *            schema:
 *              type: number
 *          - name: country
 *            description: Id o code del country per la leaderboard di tipo 1
 *            in: query
 *            required: false
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/leaderboard_list'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("", Token.autenticateUser, async function (req, res, next) {
    const leaderboard = new Leaderboard(req.user);
    const filter = new LeaderboardFilters(req.query.type, req.query.start, req.query.count, req.query.country, false);
    try {
        const data = await leaderboard.getFilteredLeaderboard(filter);
        return StaticFunctions.sendSuccess(res, data);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/leaderboard/client:
 *  get:
 *      description: Ottiene la posizione in classifica dell'utente
 *      tags: [Leaderboard]
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: type
 *            description: Tipo di classifica
 *            in: query
 *            required: false
 *            schema:
 *              type: number
 *          - name: country
 *            description: Id o code del country per la leaderboard di tipo 1
 *            in: query
 *            required: false
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/leaderboard_user'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("/client", Token.autenticateUser, async function (req, res, next) {
    const leaderboard = new Leaderboard(req.user);
    const filter = new LeaderboardFilters(req.query.type, 0, 1, req.query.country, true, req.user._id.toString());
    try {
        const data = await leaderboard.getFilteredLeaderboard(filter);
        return StaticFunctions.sendSuccess(res, data);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/leaderboard/client/{idOrUsername}:
 *  get:
 *      description: Ottiene la posizione in classifica di un utente
 *      tags: [Leaderboard]
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: idOrUsername
 *            description: Id o username di un utente
 *            in: path
 *            required: true
 *            schema:
 *              type: number
 *          - name: type
 *            description: Tipo di classifica
 *            in: query
 *            required: false
 *            schema:
 *              type: number
 *          - name: country
 *            description: Id o code del country per la leaderboard di tipo 1
 *            in: query
 *            required: false
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/leaderboard_user'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("/client/:idOrUsername", Token.autenticateUser, async function (req, res, next) {
    const leaderboard = new Leaderboard(req.user);
    const filter = new LeaderboardFilters(req.query.type, 0, 1, req.query.country, true, req.params.idOrUsername);
    try {
        const data = await leaderboard.getFilteredLeaderboard(filter);
        return StaticFunctions.sendSuccess(res, data);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/leaderboard/type:
 *  get:
 *      description: Ottiene i tipi di leaderboard supportati dalle API
 *      tags: [Leaderboard]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/leaderboard_types'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("/type", Token.autenticateUser, async function (req, res, next) {
    return StaticFunctions.sendSuccess(res, LeaderboardType.map());
});

module.exports = router
