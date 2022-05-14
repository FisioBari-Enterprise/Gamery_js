const { TokenSecret } = require('../config');
const jwt = require("jsonwebtoken");
const StaticFunctions = require('../static');

/**
 * Classe per la generazione e gestione dei JWT
 */
class Token {
    /**
     * Genera un token inserendo l'id passato
     * @param {User} user L'utente a cui assegnare il token da generare
     * @param {(error, token)} callback Funzione con due parametri: error e token
     */
    static createToken(user, callback) {
        jwt.sign(user, TokenSecret, { expiresIn: '7200s' }, function (err, token) {
            callback(err, token);
        });
    }

    /**
     * Controlla che il token sia valido
     * @param {Request} req Richiesta ricevuta
     * @param {Response} res Risposta da inviare
     * @param {NextFunction} next Prossima funzione da eseguire
     */
    static autenticateUser(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        // Se non trova il token va in
        if (token == null) {
            return StaticFunctions.sendError(res, 'Token not found', 401);
        }
        //Controlla il token
        jwt.verify(token, TokenSecret, {}, function (err, user) {
            if(err) {
                console.log(err);
                return StaticFunctions.sendError(res, 'Token not valid', 403);
            }
            req.user = user
            next()
        });
    }
}

module.exports = Token
