let express = require("express");
let Client = require('../classes/users/user');
const StaticFunctions = require("../static");
const Token = require("../classes/token");
let router = express.Router();
//View per effettuare il login
router.post("/login", async function (req, res) {
    //Controlla se ha inviato un uuid
    if(req.body.uuid !== undefined){
        let user = new Client();
        await user.getUser(req.socket.remoteAddress, null, null, null, req.body.uuid, true, function (err, token, user) {
            if(err !== null) {
                StaticFunctions.sendError(res, err.message);
            } else {
                StaticFunctions.sendSuccess(res, {access: token});
            }
        });
    } else {
        StaticFunctions.sendError(res, 'No params found');
    }
});
//Registra un utente temporaneo
router.get("/registerTemporary", function (req, res) {
    const newUser = new Client();
    newUser.createTemporary(req.socket.remoteAddress, (err, token, uuid) => {
       if(err != null || token === undefined) {
           StaticFunctions.sendError(res, token === undefined ? 'Error during creation token' : err.message);
       } else {
           StaticFunctions.sendSuccess(res, {'access': token, 'uuid': uuid});
       }
    });
});
//Controlla che il token ricevuto sia valido
router.get("/check", Token.autenticateUser, function (req, res) {
    StaticFunctions.sendSuccess(res, true);
});

module.exports = router
