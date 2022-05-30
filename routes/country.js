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
 *              description: Il risultato dell'operazione
 *          400:
 *              description: L'errore riscontrato se trovato
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

/**
 * @openapi
 * \api\country\client:
 *  get:
 *      description: Ottiene il country scelto dall'utente
 *      tags: [Country]
 *      produces:
 *          - application/json
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
 * \api\country\client:
 *  put:
 *      description: Aggiorna lo stato assegnato all'utente
 *      tags: [Country]
 *      produces:
 *          - application/json
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
 *          - name: remove
 *            description: Rimuove la preferenza dello stato
 *            in: formData
 *            required: false
 *            type: boolean
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
        await country.updateCountry(req.body.id, req.body.code, req.body.remove);
        return StaticFunctions.sendSuccess(res, country.user);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

module.exports = router
