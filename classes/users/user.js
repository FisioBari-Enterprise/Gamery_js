const Token = require('../token');
const UserModel = require('../../database/users/user');
const CredentialsModel = require('../../database/users/credentials');
const SessionModel = require('../../database/users/session');
const {cryptPassword, comparePassword} = require("../../security");
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
                // Crea i colori di base per l'icona
                newUser.preferences.colors_icon = ['#2AF39A', '#00A1F9']
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
     * @param { String | null | undefined } usernameEmail Email o username inserita dall'utente
     * @param { String | null | undefined } password Password
     * @param { String | null | undefined } uuid UUID v4 generato in fase di creazione
     * @param { boolean } getToken Nella funziona ritorna il token
     * @param { Login } callback Azione da richiamare al completamento delle operazioni
     */
    async login(ipAddress=null, usernameEmail=null, password=null, uuid=null, getToken=true, callback) {
        let user = null;
        let credentials = null;
        //Ricerca per UUID
        if (uuid != null) {
            user = await UserModel.findOne({uuid: uuid, valid: true}).exec();
            if (user === null) {
                throw "uuid not valid";
            }
            // Controllo che l'utente non contenga delle credenziali
            credentials = await CredentialsModel.findOne({user: new ObjectId(user._id)}).exec();
            if (credentials !== null) {
                throw "Credentials alredy exist for this user. You cannot login with uuid";
            }
            if (!getToken) {
                return callback(null, null, user);
            }
            Token.createToken(user._id.toString(), ipAddress,function (err, token) {
                if(err) {
                    callback(err, null, null);
                } else {
                    callback(null, token, user);
                }
            });
            return
        }
        // Ricerca per credenziali
        // Controllo input utente
        if (usernameEmail == null || usernameEmail === "") {
            throw "usernameEmail: cannot be empty"
        }
        if (password == null) {
            throw "password: cannot be empty"
        }
        if (usernameEmail.includes(' ')) {
            throw "usernameEmail: cannot contain spaces"
        }
        if (password.includes(' ')) {
            throw "password: cannot contain spaces"
        }
        if (password.length < 8 || password.length > 30) {
            throw "password: password must be 8 - 30 long";
        }
        // Ricerca per username
        user = await UserModel.findOne({username: usernameEmail, valid: true}).exec();
        if (user == null) {
            // Ricerca per email
            credentials = await CredentialsModel.findOne({email: usernameEmail}).exec();
            if (credentials == null) {
                throw "usernameEmail: username or email not valid";
            }
            user = await UserModel.findOne({_id: new ObjectId(credentials.user), valid: true}).exec();
            if (user == null) {
                throw "usernameEmail: user not active or not available"
            }
        }
        // Ottiene le credenziali se ha trovato l'utente
        if (credentials == null) {
            credentials = await CredentialsModel.findOne({user: new ObjectId(user._id)}).exec();
            if (credentials == null) {
                throw "usernameEmail: no credentials found for this user";
            }
        }
        // Controllo della password
        comparePassword(password, credentials.password, (err, match) => {
            if (err) {
                callback(err, null, null);
            }
            if (!match) {
                callback(new Error("password: password not correct"), null, null);
            }
            // Ottiene accesso
            if (!getToken) {
                return callback(null, null, user);
            }
            Token.createToken(user._id.toString(), ipAddress,function (err, token) {
                if(err) {
                    callback(err, null, null);
                } else {
                    callback(null, token, user);
                }
            });
        });
    }

    /**
     * Tenta di registrare un nuovo utente
     * @param {string} ipAddress Ip address della richiesta
     * @param {string} uuid Uuid connesso all'utente temporaneo
     * @param {string} username username inserito dall'utente
     * @param {string} email email inserita dall'utente
     * @param {string} password password inserita dall'utente
     * @param callback funzione di callback
     * @returns {Promise<void>}
     */
    async register(ipAddress, uuid, username, email, password, callback) {
        // Controlli sul uuid
        if (uuid == null) {
            throw "generic: uuid not passed"
        }
        const oldUser = await UserModel.findOne({uuid: uuid, valid: true}).exec();
        if (oldUser == null) {
            throw "generic: no user found with the uuid passed";
        }
        const oldUserCredentials = await CredentialsModel.findOne({user: new ObjectId(oldUser._id)}).exec();
        if (oldUserCredentials !== null) {
            throw "generic: this user already has credentials"
        }
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
        if (password.includes(' ')) {
            throw "password: cannot contain spaces"
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
            oldUser.username = username
            await oldUser.save();
            const credentials = new CredentialsModel({email: email, password: hash, user: oldUser._id});
            await credentials.save();
            this.id = oldUser.id;
            this.user = oldUser;
            Token.createToken(oldUser._id.toString(), ipAddress,function (err, token) {
                if(err) {
                    callback(err, null);
                } else {
                    callback(null, token);
                }
            });
        });
    }

    /**
     * Effettua il logout dell'utente costruito
     * @param {string} token Token connesso all'utente
     * @returns {Promise<void>}
     */
    async logout(token) {
        if (this.user == null) {
            await this.buildUser();
        }
        // Rende invalide la sessione
        await SessionModel.updateMany({token: token}, {valid: false}).exec();
    }

    async changePassword(password : string, passwordConfirm : string) {
        if(password == null || password === ''){
            throw "password:cannot be empty"
        }
        if(passwordConfirm == null || passwordConfirm === ''){
            throw "passwordConfirm:cannot be empty"
        }
        if(password !== passwordConfirm){
            throw "passwordConfirm:passwords do not match"
        }
        if (password.length < 8 || password.length > 30) {
            throw "password:password must be 8 - 30 long";
        }
        //TODO: Aggiornare password nel DB
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
