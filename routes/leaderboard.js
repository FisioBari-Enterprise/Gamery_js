let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const {EmailManager} = require('../classes/email');

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
    return StaticFunctions.sendSuccess(res, true);
});

module.exports = router
