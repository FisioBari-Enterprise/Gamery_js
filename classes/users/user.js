const Token = require('../token');
const UserModel = require('../../database/users/user');
const {cryptPassword} = require("../../security");
const { v4: uuidv4 } = require('uuid');

/**
 * @callback CreateTemporary
 * @param {*} err Errore riscontrato durante l'esecuzione
 * @param {String | null} token Token assegnato all'utente
 * @param {String | null} uuid Uuid assegnato all'utente temporaneo
 */

/**
 * @callback Login
 * @param {*} err Errore riscontrato durante l'esecuzione
 * @param { String | null } token Token assegnato all'utente
 * @param { * } user Oggetto JS con i dati contenuti nell'utente
 */

/**
 * Classe di gestione degli utenti
 */
class User {
    /**
     * Crea la classe
     * @param {String | null} id Id dell'utente
     * @param {User | null} user Utente completo
     */
    constructor(id=null, user=null) {
        this.id = id;
        this.user = user;
    }

    /**
     * Genera un nuovo utente temporaneo
     * @param {String} ipAddress Indirirzzo ip della richiesta
     * @param {CreateTemporary} callback Funzione da eseguire alla conclusione
     */
    createTemporary(ipAddress, callback) {
        //Genera il nuovo numero da metter dopo player
        UserModel.countDocuments({ uuid: { $exists: true } }, async function (err, c) {
            if (err != null) {
                callback(err, null, null);
            } else {
                const newNumber = c + 1;
                let uuid = uuidv4();
                //Controllo che il UUID non sia già presente
                let doc = await UserModel.findOne({uuid: uuid}).exec();
                while (doc !== null) {
                    uuid = uuidv4();
                    doc = await UserModel.findOne({uuid: uuid}).exec();
                }
                //Genera il nuovo utente
                const newUser = new UserModel({username: `Player${newNumber}`, uuid: uuid});
                await newUser.save();
                const newUserJson = JSON.parse(JSON.stringify(newUser));
                Token.createToken(newUserJson, ipAddress, (err, token) => {
                    callback(err, token, uuid);
                });
            }
        });
    }

    /**
     * Cerca l'utente in base ai dati passati
     * @param { String | null } ipAddress Indirizzo ip della richiesta necessario per la generazione del toke
     * @param { String | null | undefined } id Id assegnato all'utente
     * @param { String | null | undefined } email Email inserita dall'utente
     * @param { String | null | undefined } password Password
     * @param { String | null | undefined } uuid UUID v4 generato in fase di creazione
     * @param { boolean } getToken Nella funziona ritorna il token
     * @param { Login } callback Azione da richiamare al completamento delle operazioni
     */
    async getUser(ipAddress=null,id=null, email=null, password=null, uuid=null, getToken=true, callback) {
        let userJson = null;
        //Ricerca per UUID
        if (uuid !== null) {
            if (uuid === undefined) {
                return callback(new Error('UUID not found'), null, null);
            }
            userJson = await UserModel.findOne({uuid: uuid}).lean().exec();
        }
        //Controllo se ha trovato i dati
        if (userJson == null) {
            callback(new Error('No user found'), null, null);
        } else {
            if (!getToken) {
                return callback(null, null, userJson);
            }
            Token.createToken(userJson, ipAddress,function (err, token) {
                if(err) {
                    callback(err, null, null);
                } else {
                    callback(null, token, userJson);
                }
            });
        }
    }
}

module.exports = User
