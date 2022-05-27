let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
/**
 * @openapi
 * \api\:
 *  get:
 *      description: End point di prova
 *      tags: [Default]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Risposta corretta
 */
router.get("", async function (req, res, next) {
    //StaticFunctions.sendSuccess(res, require('crypto').randomBytes(64).toString('hex'));
    StaticFunctions.sendSuccess(res, true);
});

module.exports = router
