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
        return StaticFunctions.sendSuccess(res, true);
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
 *      
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
 * /api/country/client:
 *  get:
 *      description: Ottiene il country scelto dall'utente
 *      tags: [Country]
 *      
 *      responses:
 *          200:
 *              description: Il country selezionato dall'utente
 *          400:
 *              description: Errore riscontrato nell'esecuzione
 *          403:
 *              description: Accesso negato
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
 *      
 *      parameters:
 *          - name: id
 *            description: Id dello stato
 *            in: formData
 *            required: false
 *            type: string
 *          - name: code
 *            description: Codice dello stato
 *            in: formData
 *            required: false
 *            type: string
 *      responses:
 *          200:
 *              description: L'utente aggiornato
 *          400:
 *              description: Errore riscontrato nell'esecuzione
 *          403:
 *              description: Accesso negato
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
 *      
 *      responses:
 *          200:
 *              description: Il country selezionato dall'utente
 *          400:
 *              description: Errore riscontrato nell'esecuzione
 *          403:
 *              description: Accesso negato
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
