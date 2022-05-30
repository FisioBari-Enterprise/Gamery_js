const StaticFunctions = require("../../../static");
const EmailType = require("../../../database/enum/emailType");
const Token = require("../../token");

module.exports = class UserValidator {
    /**
     * Controlla che nella richiesta ci sia un token valido
     * @param req
     * @param res
     * @param next
     */
    static async checkConfirmEmail(req, res, next) {
        await UserValidator.checkTokenExists(req, res, EmailType.CONFIRM_EMAIL, async (err, credentials) => {
            if (err != null) {
                return StaticFunctions.sendResultHTML(res, err.message);
            }
            // Conferma l'account
            if (credentials.confirm) {
                return StaticFunctions.sendResultHTML(res, 'Account already activated');
            }
            credentials.confirm = true;
            credentials.token.active = false;
            await credentials.save();
            next();
        });
    }

    /**
     * Controlla che nella richiesta per ottenere la pagina di reset della password ci sia un token valido
     * @param req
     * @param res
     * @param next
     */
    static async checkResetPassword(req, res, next) {
        await UserValidator.checkTokenExists(req, res, EmailType.PASSWORD_RESET, async (err, credentials) => {
            if (err != null) {
                return StaticFunctions.sendResultHTML(res, err.message);
            }
            req.user = credentials.user
            next();
        });
    }

    /**
     * Controlla se esiste il token nella richiesta e se è valido
     * @param {Request} req Richiesta ricevuta
     * @param {Response} res Risposta da inviare
     * @param {Number} type Tipo di token
     * @param callback Callback che contiene l'errore se esiste e le credenziali associate al token
     * @return {null | Response}
     */
    static async checkTokenExists(req, res, type, callback) {
        const token = req.query.token;
        if (token == null) {
            callback(new Error('No token found'), null);
        }
        // Cerca di risolvere il token
        await Token.checkTokenEmail(token, type, (err, credentials) => {
            callback(err, credentials);
        })
    }

    /**
     * Controlla se la richiesta è arrivata dal localhost
     * @param {Request} req Richiesta ricevuta
     * @param {Response} res Risposta da inviare
     * @param {*} next Prossima funzione da eseguire
     * @return {null | Response}
     */
    static async onlyLocalHost(req, res, next) {
        if (req.socket.remoteAddress !== "::1") {
            return StaticFunctions.sendError(res, 'This ip haven\'t the access to the endpoint', 403);
        }
        next();
    }
}
