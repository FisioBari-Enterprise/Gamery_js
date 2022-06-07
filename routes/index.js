let express = require("express");
let router = express.Router();
const StaticFunctions = require("../static");
const {EmailManager} = require('../classes/email');
const UserModel = require('../database/users/user');
const fs = require("fs");

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
    /*let all_users;
    try {
        all_users = JSON.parse(fs.readFileSync('./json/users.json', 'utf-8'));
    } catch {
        return StaticFunctions.sendError(res, 'Impossibile get users');
    }
    // Ripristina gli utenti
    let to_insert = [];
    all_users.forEach(item => {
        if (item.username == null) {
            return;
        }
       to_insert.push({username: item.username, uuid: item.uuid});
    });
    await UserModel.insertMany(to_insert);*/
    return StaticFunctions.sendSuccess(res, true);
});

module.exports = router
