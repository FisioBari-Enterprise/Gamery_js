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
    let user = new Client();
    try {
        await user.login(req.socket.remoteAddress, req.body.usernameEmail, req.body.password, req.body.uuid, true, function (err, token, user) {
            if(err !== null) {
                StaticFunctions.sendError(res, err.message);
            } else {
                StaticFunctions.sendSuccess(res, {access: token});
            }
        });
    } catch (error) {
        StaticFunctions.sendError(res, error);
    }
});
//Registra un utente temporaneo
router.get("/register/temporary", function (req, res) {
    const newUser = new Client();
    newUser.createTemporary(req.socket.remoteAddress, (err, token, uuid) => {
       if(err != null || token === undefined) {
           StaticFunctions.sendError(res, token === undefined ? 'Error during creation token' : err.message);
       } else {
           StaticFunctions.sendSuccess(res, {'access': token, uuid: uuid});
       }
    });
});
//Registra un nuovo utente
router.post('/register', async function (req, res) {
    let user = new User();
    try {
        await user.register(req.socket.remoteAddress, req.body.uuid, req.body.username, req.body.email, req.body.password, (err, token) => {
            if (err !== null) {
                return StaticFunctions.sendError(res, err);
            }
            StaticFunctions.sendSuccess(res, {access: token, uuid: user.user.uuid});
        });
    } catch (error) {
        return StaticFunctions.sendError(res, error);
    }
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
        return StaticFunctions.sendError(res, error);
    }
    StaticFunctions.sendSuccess(res, user.user);
});

module.exports = router
