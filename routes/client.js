let express = require("express");
let Client = require('../classes/users/user');
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const User = require("../classes/users/user");
let router = express.Router();
/**
 * @openapi
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
                StaticFunctions.sendSuccess(res, {access: token, uuid: user.uuid});
            }
        });
    } catch (error) {
        StaticFunctions.sendError(res, error);
    }
});
/**
 * @openapi
 * \api\client\register\temporary:
 *  post:
 *      description: Registra un nuovo utente temporaneo
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Token di accesso e uuid assegnato
 *          400:
 *              description: Errore riscontrato in fase di creazione
 */
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
/**
 * @openapi
 * \api\client\register:
 *  post:
 *      description: Registra un nuovo utente
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Token di accesso e uuid assegnato
 *          400:
 *              description: Errore riscontrato in fase di creazione
 */
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
/**
 * @openapi
 * \api\client\check:
 *  post:
 *      description: Controllo che il token passato sia valido
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Token di accesso e uuid assegnato
 *          403:
 *              description: Accesso non consentito
 */
router.get("/check", Token.autenticateUser, function (req, res) {
    StaticFunctions.sendSuccess(res,true);
});
/**
 * @openapi
 * \api\client\logout:
 *  get:
 *      description: Effettua ol logout
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Risposta di base
 *          400:
 *              description: Errore durante l'esecuzione dell'azione
 *          403:
 *              description: Accesso non consentito
 */
router.get('/logout', Token.autenticateUser, async function (req, res) {
    let user = new User(req.user._id);
    try {
        await user.logout(req.headers['authorization'].split(' ')[1])
        StaticFunctions.sendSuccess(res, true);
    } catch (error) {
        StaticFunctions.sendError(res, error);
    }
})
/**
 * @openapi
 * \api\client:
 *  get:
 *      description: Informazioni dell'utente
 *      tags: [Users]
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Dati dell'utente
 *          400:
 *              description: Errore durante l'esecuzione dell'azione
 *          403:
 *              description: Accesso non consentito
 */
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
