let express = require("express");
let Client = require('../classes/users/user');
const StaticFunctions = require("../static");
const Token = require("../classes/token");
const User = require("../classes/users/user");
const UserValidator = require("../classes/users/validator/userValidator");
let router = express.Router();

/**
 * @openapi
 * /api/client/login:
 *  post:
 *      description: Effettua il login
 *      tags: [Users]
 *      requestBody:
 *          $ref: '#/components/requestBodies/login'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/login'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 */
router.post("/login", async function (req, res) {
    let user = new Client();
    try {
        await user.login(req.socket.remoteAddress, req.body.usernameEmail, req.body.password, req.body.uuid, true, function (err, token, user) {
            if(err !== null) {
                StaticFunctions.sendError(res, err.message);
            } else {
                StaticFunctions.sendSuccess(res, {access: token, uuid: user.uuid}, 201);
            }
        });
    } catch (error) {
        return StaticFunctions.sendError(res, error);
    }
});

/**
 * @openapi
 * /api/client/register/temporary:
 *  get:
 *      description: Registra un nuovo utente temporaneo
 *      tags: [Users]
 *      responses:
 *          200:
 *              $ref: '#/components/responses/login'
 *          400:
 *              $ref: '#/components/responses/bad_request'
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
 * /api/client/register:
 *  post:
 *      description: Registra un nuovo utente
 *      tags: [Users]
 *      requestBody:
 *          $ref: '#/components/requestBodies/registration'
 *      responses:
 *          201:
 *              $ref: '#components/responses/login'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 */
router.post('/register', async function (req, res) {
    let user = new User();
    try {
        await user.register(req.socket.remoteAddress, req.body.uuid, req.body.username, req.body.email, req.body.password, (err, token) => {
            if (err !== null) {
                return StaticFunctions.sendError(res, err);
            }
            StaticFunctions.sendSuccess(res, {access: token, uuid: user.user.uuid}, 201);
        });
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});
/**
 * @openapi
 * /api/client/check:
 *  get:
 *      description: Controllo che il token sia valido
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/base_response'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get("/check", Token.autenticateUser, function (req, res) {
    StaticFunctions.sendSuccess(res,true);
});
/**
 * @openapi
 * /api/client/logout:
 *  get:
 *      description: Effettua il logout
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/base_response'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 * /api/client:
 *  get:
 *      description: Informazioni dell'utente
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      responses:
 *          200:
 *              $ref: '#components/responses/full_user'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
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
 * /api/client/confirm:
 *  get:
 *      description: Conferma l'indirizzo email
 *      tags: [Users]
 *      parameters:
 *          - name: token
 *            description: Token inviato per email
 *            in: query
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: HTML con l'indicazione del successo dell'azione
 *          400:
 *              description: HTML con la descrizione dell'errore
 */
router.get("/confirm", UserValidator.checkConfirmEmail, function(req,res){
    return StaticFunctions.sendResultHTML(res, 'Account successfully confirmed', false);
});
/**
 * @openapi
 * /api/client/change/password:
 *  get:
 *      description: Form per inviare la modifica della password
 *      tags: [Users]
 *      parameters:
 *          - name: token
 *            description: Token inviato per email
 *            in: query
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Pagina web per il ripristino della password
 *          400:
 *              description: HTML con la descrizione dell'errore
 */
router.get("/change/password", UserValidator.checkResetPassword, async function(req,res) {
    // Renderizza la pagina HTML
    return StaticFunctions.sendPasswordResetHTML(res);
});
/**
 * @openapi
 * /api/client/change/password:
 *  post:
 *      description: Resetta la password per l'utente
 *      tags: [Users]
 *      parameters:
 *          - name: token
 *            description: Token inviato per email
 *            in: query
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          $ref: '#/components/requestBodies/change_password'
 *      responses:
 *          200:
 *              description: HTML con l'indicazione del successo dell'azione
 *          400:
 *              description: HTML con la descrizione dell'errore
 */
router.post("/change/password", UserValidator.checkResetPassword, async function(req,res){
    const link = '/api/client/change/password?token=' + req.query.token;
    let user = new User(req.user._id);
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm;
    try {
        await user.buildUser();
        await user.changePassword(password, passwordConfirm, (passwordError, passwordConfirmError) => {
            if (passwordError != null || passwordConfirmError != null) {
                return StaticFunctions.sendPasswordResetHTML(res, passwordError, passwordConfirmError);
            }
            return StaticFunctions.sendResultHTML(res, 'Password successfully changed', false);
        });
    } catch (error) {
        return StaticFunctions.sendResultHTML(res, typeof  error === 'string' ? error : error.message, true, link);
    }
});

/**
 * @openapi
 * /api/client/change/password:
 *  put:
 *      description: Richiede un reset della password. Il link viene inviato per email
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/change_password_email'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/base_response'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.put("/change/password", Token.autenticateUser, async function(req,res) {
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
 * /api/client/settings:
 *  put:
 *      description: Modifica le importazioni dell'utente
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/setting'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/base_response'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.put('/settings', Token.autenticateUser, async function(req, res) {
    const user = new User(req.user._id);

    const font_size = req.body.font_size;
    const volume = req.body.volume;
    const sound = req.body.sound;

    try {
        await user.changeSettings(font_size, volume, sound);
        StaticFunctions.sendSuccess(res, true);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
});

router.get('/settings', Token.autenticateUser, async function(req, res) {
    const user = new User(req.user._id);
    try {
        await user.buildUser()
        StaticFunctions.sendSuccess(res, user.user.settings);
    } catch (error) {
        return StaticFunctions.sendError(res, typeof  error === 'string' ? error : error.message);
    }
})

/**
 * @openapi
 * /api/client/{id}:
 *  get:
 *      description: Richiedo le informazioni di un utente attraverso l'id
 *      tags: [Users]
 *      security:
 *          - userAuth: []
 *      parameters:
 *          - name: id
 *            description: Id dell'utente da ricercare
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/simple_user'
 *          400:
 *              $ref: '#/components/responses/bad_request'
 *          401:
 *              $ref: '#/components/responses/no_token'
 *          403:
 *              $ref: '#/components/responses/no_access'
 */
router.get('/:id', Token.autenticateUser, async function(req, res) {
    let user = new User(req.params.id);

    try {
        await user.buildSimpleUser();

        StaticFunctions.sendSuccess(res, user.user);

    } catch (error) {
        return StaticFunctions.sendError(res, typeof error === 'string' ? error : error.message);
    }
});

module.exports = router
