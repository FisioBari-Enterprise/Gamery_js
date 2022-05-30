let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const {Country, updateCountries} = require("../classes/leaderboard/country");
const UserValidator = require("../classes/users/validator/userValidator");

/**
 * @openapi
 * \api\country:
 *  get:
 *      description: Ottiene tutti gli stati con le bandiere supportati
 *      tags: [Country]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Lista degli stati
 *          403:
 *              description: Accesso negato
 */
router.get("", Token.autenticateUser, async function (req, res, next) {
    const country = new Country();
    try {
        const allCountry = await country.getAll();
        return StaticFunctions.sendSuccess(res, allCountry);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * \api\country:
 *  post:
 *      description: Aggiunge i country al DB. Disponibile solo in localhost
 *      tags: [Country]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Lista degli stati
 *          403:
 *              description: Accesso negato
 */
router.post("", UserValidator.onlyLocalHost, async function (req, res, next) {
    try {
        await updateCountries(req.body.countries);
        return StaticFunctions.sendSuccess(res, true);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

module.exports = router
