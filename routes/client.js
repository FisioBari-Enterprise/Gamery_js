let express = require("express");
let Client = require('../classes/users/user');
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const User = require("../classes/users/user");
const UserValidator = require("../classes/users/validator/userValidator");
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
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
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
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
    StaticFunctions.sendSuccess(res, user.user);
});
/**
 * @openapi
 * \api\client\confirm:
 *  get:
 *      description: Conferma l'indirizzo email
 *      tags: [Users]
 *      parameters:
 *          - name: token
 *            description: Token inviato per email
 *            in: query
 *            required: true
 *            type: string
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Risultato dell'operazione
 *          400:
 *              description: Errore durante l'esecuzione dell'azione
 *          403:
 *              description: Accesso non consentito. Token non valido
 */
router.get("/confirm", UserValidator.checkConfirmEmail, function(req,res){
    return StaticFunctions.sendResultHTML(res, 'Account successfully confirmed', false);
});
/**
 * @openapi
 * \api\client\change\password:
 *  post:
 *      description: Richiede un reset della password. Il link viene inviato per email
 *      tags: [Users]
 *      parameters:
 *          - name: email
 *            description: Email al quale inviare il reset della password
 *            in: formData
 *            required: true
 *            type: string
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successo dell'azione
 *          400:
 *              description: Errore durante l'esecuzione dell'azione
 *          403:
 *              description: Accesso non consentito. Token non valido
 */
router.post("/change/password", Token.autenticateUser, async function(req,res) {
    const user = new User(req.user._id);
    const email = req.body.email;
    try{
        await user.sendResetPassword(email, (err) => {
            if (err != null) {
                return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
            } else {
                return StaticFunctions.sendSuccess(res, true);
            }
        })
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});
/**
 * @openapi
 * \api\client\change\password:
 *  get:
 *      description: Resetta la password per l'utente
 *      tags: [Users]
 *      parameters:
 *          - name: token
 *            description: Token inviato per email
 *            in: query
 *            required: true
 *            type: string
 *          - name: password
 *            description: La nuova password
 *            in: formData
 *            required: true
 *            type: string
 *          - name: passwordConfirm
 *            description: Il doppio inserimento della nuova password
 *            in: formData
 *            required: true
 *            type: string
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successo dell'azione
 *          400:
 *              description: Errore durante l'esecuzione dell'azione
 *          403:
 *              description: Accesso non consentito. Token non valido
 */
router.put("/change/password", Token.autenticateUser, async function(req,res){
    let user = new User(req.user._id);
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm;
    try{
        await user.changePassword(password,passwordConfirm);
    } catch (error){
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
    return StaticFunctions.sendSuccess(res, true);
});

module.exports = router
