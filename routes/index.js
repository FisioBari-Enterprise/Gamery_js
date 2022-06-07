let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const {EmailManager} = require('../classes/email');

// Endpoint per fare i test
router.get("", async function (req, res, next) {
    //return StaticFunctions.sendSuccess(res, require('crypto').randomBytes(64).toString('hex'));
    /* const email = new EmailManager();
    try {
        await email.sendConfirmEmail('leonardolazzarin14@gmail.com', (err) => {
            if (err != null) {
                return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
            }
            return StaticFunctions.sendSuccess(res, true);
        });
    } catch (e) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
     */
    return StaticFunctions.sendSuccess(res, true);
});

module.exports = router
