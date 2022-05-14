const { TokenSecret } = require('../config');
const jwt = require("jsonwebtoken");
const StaticFunctions = require('../static');
const SessionModel = require('../database/users/session');

/**
 * @callback CreateToken
 * @param {*} error Errore riscontrato in creazione del token
 * @param {String | null} token Token generato
 */

/**
 * Classe per la generazione e gestione dei JWT
 */
class Token {
    /**
     * Genera un token inserendo l'id passato
     * @param {User} user L'utente a cui assegnare il token da generare
     * @param {String} ipAddress Indirizzo ip della richiesta
     * @param {CreateToken} callback Funzione con due parametri: error e token
     */
    static createToken(user, ipAddress, callback) {
        jwt.sign(user, TokenSecret, { expiresIn: '7200s' }, async function (err, token) {
            if (err != null) {
                callback(err, null);
            } else {
                // Controlla se il token non è già stato usato
                const alreadyExist = await SessionModel.findOne({token: token, valid: true}).exec();
                if (alreadyExist === null) {
                    const newSession = new SessionModel({token: token, valid: true, ipAddress: ipAddress, user: user._id});
                    await newSession.save();
                    callback(null, token);
                } else {
                    Token.createToken(user, ipAddress, callback);
                }
            }
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
        jwt.verify(token, TokenSecret, {}, async function (err, user) {
            if(err) {
                return StaticFunctions.sendError(res, 'Token not valid', 403);
            }
            const session = await SessionModel.findOne({token: token, valid: true}).exec()
            if (session == null) {
                return StaticFunctions.sendError(res, 'Session not found', 403);
            }
            req.user = user
            next()
        });
    }
}

module.exports = Token
