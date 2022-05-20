const { TokenSecret } = require('../config');
const jwt = require("jsonwebtoken");
const StaticFunctions = require('../static');
const SessionModel = require('../database/users/session');
const UserModel = require('../database/users/user');
const ObjectId = require('mongoose').Types.ObjectId;

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
     * @param {String} userId L'utente a cui assegnare il token da generare
     * @param {String} ipAddress Indirizzo ip della richiesta
     * @param {CreateToken} callback Funzione con due parametri: error e token
     */
    static createToken(userId, ipAddress, callback) {
        jwt.sign(userId, TokenSecret, { expiresIn: '7200s' }, async function (err, token) {
            if (err != null) {
                callback(err, null);
            } else {
                // Controlla se il token non è già stato usato
                const alreadyExist = await SessionModel.findOne({token: token, valid: true}).exec();
                if (alreadyExist === null) {
                    const newSession = new SessionModel({token: token, valid: true, ipAddress: ipAddress, user: userId});
                    await newSession.save();
                    callback(null, token);
                } else {
                    Token.createToken(userId, ipAddress, callback);
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
    static async autenticateUser(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        // Token non trovato nel header della richiesta
        if (token == null) {
            return StaticFunctions.sendError(res, 'Token not found', 401);
        }
        //Controlla il token
        jwt.verify(token, TokenSecret, {}, async function (err, userId) {
            if(err) {
                //Rende la sessione non valida se la trova nel DB
                await SessionModel.updateMany({token: token}, {valid: false}).exec();
                return StaticFunctions.sendError(res, 'Token not valid', 403);
            }
            const session = await SessionModel.findOne({token: token, valid: true}).populate('user').exec()
            if (session == null) {
                return StaticFunctions.sendError(res, 'Session not found', 403);
            }
            // Controllo sull'utente attivo
            if (session.user === null || session.user._id === userId) {
                return StaticFunctions.sendError(res, 'User not found', 403);
            }
            // Controllo se l'utente è attivo
            if(!session.user.active) {
                return StaticFunctions.sendError(res, 'User not active', 403);
            }
            req.user = session.user;
            next()
        });
    }
}

module.exports = Token
