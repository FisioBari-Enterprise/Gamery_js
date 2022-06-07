const Token = require('../token');
const UserModel = require('../../database/users/user');
const CredentialsModel = require('../../database/users/credentials');
const SessionModel = require('../../database/users/session');
const {cryptPassword, comparePassword} = require("../../security");
const { v4: uuidv4 } = require('uuid');
const emailManager = require("../email");
const SingleGameDB = require("../../database/game/singleGame");
const GameRoundDB = require("../../database/game/gameRound")
const Languages = require("../../database/enum/languages")
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

        let doc = await UserModel.findOne({_id : new ObjectId(this.id)}).populate('country').exec();

        if(doc === null)
            throw "Utente non trovato"

        this.user = doc;
    }

    async buildSimpleUser(){
        let nUser = await UserModel.findOne(
            {_id : new ObjectId(this.id)},
            { _id: 1, username: 1, statistics : 1, country : 1})
            .populate('statistics').populate('country').exec()

        if(nUser === null){
            throw "Utente non trovato"
        }
        this.user = nUser;
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
               return callback("generic: error password encryption");
           }

            const credentials = new CredentialsModel({email: email, password: hash, user: oldUser._id});
            await credentials.save();
            this.id = oldUser.id;
            this.user = oldUser;

            // Invio email per il reset della password
            await emailManager.sendConfirmEmail(email, username, async (err) => {
                if (err != null) {
                    return callback(err, null);
                }
                //aggiornamento username
                oldUser.username = username
                await oldUser.save();
                // Generazione del token per l'accesso
                Token.createToken(oldUser._id.toString(), ipAddress,function (err, token) {
                    if(err) {
                        callback(err, null);
                    } else {
                        callback(null, token);
                    }
                });
            })
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

    /**
     * Invia per email il link per il reset della password
     * @param {String} email Email alla quale inviare il reset della password
     * @param callback Callback che contiene un errore se lo trova
     * @return {Promise<void>}
     */
    async sendResetPassword(email, callback) {
        // Controllo che il campo email sia corretto
        if (email == null || validateEmail(email) == null) {
            throw 'Email not valid';
        }
        // Controllo che l'email sia registrata nel sistema
        const credentials = await CredentialsModel.findOne({email: email, confirmed: true}).populate('user').exec();
        if (credentials == null) {
            throw 'Email not registered';
        }
        // Invia l'email
        await emailManager.sendPasswordReset(email, credentials.user.username, (err) => callback(err));
    }

    /**
     * Effettua la modifica della password
     * @param {String} password Nuova password
     * @param {String} passwordConfirm Conferma della nuova password
     * @param callback Contiene gli eventuali errori riscontrati. passwordError e passwordConfirmError
     * @return {Promise<void>}
     */
    async changePassword(password, passwordConfirm, callback) {
        // Controllo dei dati
        if(password == null || password === ''){
            return callback('Cannot be empty', null);
        }
        if(passwordConfirm == null || passwordConfirm === ''){
            return callback(null, 'Cannot be empty');
        }
        if (password.length < 8 || password.length > 30) {
            return callback('Password must be 8 - 30 long', null);
        }
        if(password !== passwordConfirm){
            return callback(null, 'Passwords do not match');
        }
        // Ottiene le credenziali
        const credentials = await CredentialsModel.findOne({
            user: {
                _id: new ObjectId(this.user._id),
                active: true
            }
        }).populate('user').exec();
        if (credentials == null) {
            return callback('Credentials not found for this link', null);
        }
        // Controlla che la nuova password non sia uguale a quella precedente
        comparePassword(password, credentials.password, (err, match) => {
            if (err != null) {
                return callback(err.message, null);
            }
            if (match) {
                return callback('New password cannot be equal to previous one', null);
            }
            // Cripta la nuova password
            cryptPassword(password, async (err, hash) => {
                if (err != null) {
                    return callback(err.message, null);
                }
                // Aggiorna la nuova password e rende non valido il token
                credentials.password = hash;
                credentials.token.active = false;
                await credentials.save();
                // Rende invalide tutte le sessioni con questo utente
                await SessionModel.updateMany({user: {_id: new ObjectId(this.user._id)}}, {valid: false}).exec();
                // Risposta di completamento con successo
                callback(null, null);
            });
        });
    }

    /**
     * Funzione per cambiare le impostazioni dell'utente
     * @param font_size{number}
     * @param volume{number}
     * @param sound{boolean}
     */
    async changeSettings(font_size, volume, sound) {
        await this.buildUser();

        //Controlla che i tipi delle variabili siano corretti
        if (typeof font_size != "number" || typeof volume != "number" || typeof sound != "boolean") {
            throw "Typing does not match";
        }
        //Controlla che i valori delle variabili siano nel range ammesso
        if (font_size < 10 || font_size > 24) {
            throw "Font size parameter out of range"
        }
        if (volume < 0 || volume > 10) {
            throw "Volume parameter out of range"
        }
        //Cambia i parametri delle impostazioni con quelli in input
        this.user.settings.font_size = font_size;
        this.user.settings.volume = volume;
        this.user.settings.sound = sound;
        //Salva le modifiche
        await this.user.save();
    }

    /**
     * Ottengo le partite precedenti dell'utente
     * @param nGame{number} numero di partite da ottenere
     * @returns {[*]} array delle partite
     */
    async getGames(nGame){

        let gamesQuery = SingleGameDB.find({user: this.user._id, complete: true}).sort({createdAt : -1});
        if(nGame > -1){
            gamesQuery = gamesQuery.limit(nGame)
        }
        let games = await gamesQuery.exec();
        if(games.length === 0){
            throw "No game found for this user"
        }
        return games
    }

    async getGameRounds(id){
        let rounds = await GameRoundDB.find(
            {user: this.user._id, game : {_id : new ObjectId(id)}},
            {points : 1, round : 1, correct : 1, _id : 1}
        ).lean().exec();

        if(rounds.length === 0){
            throw "No round found for this game"
        }
        return rounds;
    }

    async getGameRound(id, number){

        let round = await GameRoundDB.findOne(
            { user: this.user._id, game : {_id : new ObjectId(id)}, round : number},
            {_id : 1, round : 1, words : 1}
        ).populate([
            {
                path: "words.word"
            },
            {
                path: "game",
                select: "language"
            }

        ]).lean().exec();

        if(round == null){
            throw "Round not found"
        }

        let languageField = Languages.getWordFields(round.game.language)

        round.words.forEach((item) => {
            if(item.word != null) {
                item.word = item.word[languageField[0]]
            }
        });


        return round;
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
