const StaticFunctions = require("../../../static");
const EmailType = require("../../../database/enum/emailType");
module.exports = class UserValidator {
    /**
     * Controlla che nella richiesta ci sia un token valido
     * @param req
     * @param res
     * @param next
     */
    static async checkConfirmEmail(req, res, next) {
        const error = await UserValidator.checkTokenExists(req, res, EmailType.CONFIRM_EMAIL);
        if (error != null) {
            return error;
        }
        next();
    }

    /**
     * Controlla se esiste il token nella richiesta e se è valido
     * @param {Request} req Richiesta ricevuta
     * @param {Response} res Risposta da inviare
     * @param {Number} type Tipo di token
     * @return {null | Response}
     */
    static async checkTokenExists(req, res, type) {
        const token = req.query.token;
        if (token == null) {
            return StaticFunctions.sendHTMLError(res, 'No token found');
        }
        return null;
    }
}
