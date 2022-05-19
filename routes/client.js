let express = require("express");
let Client = require('../classes/users/user');
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const User = require("../classes/users/user");
let router = express.Router();
/**
 * @swagger
 * \api\client\login:
 *  post:
 *      description: Effettua il login
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Login effettuato con successo
 */
router.post("/login", async function (req, res) {
    //Controlla se ha inviato un uuid
    if(req.body.uuid !== undefined){
        let user = new Client();
        await user.login(req.socket.remoteAddress, null, null, null, req.body.uuid, true, function (err, token, user) {
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
router.get("/register/temporary", function (req, res) {
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
    StaticFunctions.sendSuccess(res,true);
});

router.get("", Token.autenticateUser, async function(req,res){

    let user = new User(req.user._id)
    try{
         await user.buildUser();
    } catch (error) {
        console.log(error)
        return StaticFunctions.sendError(res, error);

    }
    StaticFunctions.sendSuccess(res, user.user);
});

module.exports = router
