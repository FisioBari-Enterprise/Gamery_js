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
 *      
 *      responses:
 *          200:
 *              description: Classifica
 *          400:
 *              description: Errore durante la generazione
 *          403:
 *              description: Accesso non consentito
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
 *      
 *      responses:
 *          200:
 *              description: Posizione in classifica
 *          400:
 *              description: Errore durante la generazione
 *          403:
 *              description: Accesso non consentito
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
 * /api/leaderboard/client/:idOrUsername:
 *  get:
 *      description: Ottiene la posizione in classifica di un utente in base all'id o al username
 *      tags: [Leaderboard]
 *      
 *      responses:
 *          200:
 *              description: Posizione in classifica
 *          400:
 *              description: Errore durante la generazione
 *          403:
 *              description: Accesso non consentito
 */
router.get("/client/:idOrUsername", Token.autenticateUser, async function (req, res, next) {
    const leaderboard = new Leaderboard(req.user);
    console.log(req.params.idOrUsername);
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
 *      
 *      responses:
 *          200:
 *              description: I tipi di classifica
 *          403:
 *              description: Accesso non consentito
 */
router.get("/type", async function (req, res, next) {
    return StaticFunctions.sendSuccess(res, LeaderboardType.map());
});

module.exports = router
