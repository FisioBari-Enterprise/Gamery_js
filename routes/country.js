let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const {Country, updateCountries} = require("../classes/leaderboard/country");
const UserValidator = require("../classes/users/validator/userValidator");

// Carica le nazioni
router.post("", UserValidator.onlyLocalHost, async function (req, res, next) {
    try {
        await updateCountries(req.body.countries);
        return StaticFunctions.sendSuccess(res, true, 201);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/country:
 *  get:
 *      description: Ottiene tutti gli stati con le bandiere supportati
 *      tags: [Country]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/all_country'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 * /api/country/client:
 *  get:
 *      description: Ottiene il country scelto dall'utente
 *      tags: [Country]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/user_country'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("/client", Token.autenticateUser, async function (req, res, next) {
    const country = new Country(req.user);
    try {
        return StaticFunctions.sendSuccess(res, country.getCountryUser());
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/country/client:
 *  put:
 *      description: Aggiorna lo stato assegnato all'utente
 *      tags: [Country]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/full_user'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.put("/client", Token.autenticateUser, async function (req, res, next) {
    const country = new Country(req.user);
    try {
        await country.updateCountry(req.body.id, req.body.code);
        return StaticFunctions.sendSuccess(res, country.user);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

/**
 * @openapi
 * /api/country/client:
 *  delete:
 *      description: Rimuove il country selezionato dall'utente
 *      tags: [Country]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/user_delete_country'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.delete("/client", Token.autenticateUser, async function (req, res, next) {
    const country = new Country(req.user);
    try {
        await country.removeCountry();
        return StaticFunctions.sendSuccess(res, country.user);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

module.exports = router
