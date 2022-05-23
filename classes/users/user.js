const Token = require('../token');
const UserModel = require('../../database/users/user');
const CredentialsModel = require('../../database/users/credentials');
const {cryptPassword} = require("../../security");
const { v4: uuidv4 } = require('uuid');
let ObjectId = require("mongoose").Types.ObjectId;

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

// const user = new User(req.user._id);
// user.serialize();

/**
 * Classe di gestione degli utenti
 */
class User {
    /**
     * Crea la classe
     * @param {String | null} id Id dell'utente
     */
    constructor(id=null) {
        this.id = id;
        this.user = null;
    }

    /**
     * Costruisce
     * @returns {Promise<void>}
     */
    async buildUser(){

        let doc = await UserModel.findOne({_id : new ObjectId(this.id)}).exec();

        if(doc === null)
            throw "Utente non trovato"

        this.user = doc;
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
                Token.createToken(newUser._id.toString(), ipAddress, (err, token) => {
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
    async login(ipAddress=null,id=null, email=null, password=null, uuid=null, getToken=true, callback) {
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
            Token.createToken(userJson._id.toString(), ipAddress,function (err, token) {
                if(err) {
                    callback(err, null, null);
                } else {
                    callback(null, token, userJson);
                }
            });
        }
    }

    /**
     * Tenta di registrare un nuovo utente
     * @param {string} username username inserito dall'utente
     * @param {string} email email inserita dall'utente
     * @param {string} password password inserita dall'utente
     * @param callback funzione di callback
     * @returns {Promise<void>}
     */
    async register(username, email, password, callback) {
        // Controllo non vuoti
        if (username == null || username === "") {
            throw "username: cannot be empty";
        }
        if (email == null || email === "") {
            throw "email: cannot be empty";
        }
        if (password == null || password === "") {
            throw "password: cannot be empty";
        }
        // Controllo formattazione
        if (username.includes(' ')) {
            throw "username: cannot contain spaces"
        }
        if (validateEmail(email) === null) {
            throw "email: email not valid"
        }
        if (password.length < 8 || password.length > 30) {
            throw "password: password must be 8 - 30 long";
        }
        // Controllo esistenza username ed email
        const usernameSaved = await UserModel.findOne({username: username}).exec();
        if (usernameSaved !== null) {
            throw "username: username already used";
        }
        const emailSaved = await CredentialsModel.findOne({email: email}).exec();
        if (emailSaved !== null) {
            throw "email: email already used";
        }
        // Salva il nuovo utente
        cryptPassword(password, async (err, hash) => {
           if (err != null) {
               callback("generic: error password encryption");
           }
            const newUser = new UserModel({username: username, uuid: null});
            await newUser.save();
            const credentials = new CredentialsModel({email: email, password: hash, user: newUser._id});
            await credentials.save();
            this.id = newUser.id;
            this.user = newUser;
            callback(null);
        });
    }
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

module.exports = User
