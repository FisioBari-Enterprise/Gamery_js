const nodemailer = require("nodemailer");
const {IdEmail, PasswordEMail, Host, TokenEmail} = require("../config");
const EmailDB = require("../database/users/email");
const Credentials = require("../database/users/credentials");
const path = require("path");
const EmailType = require("../database/enum/emailType");
const Token = require("./token");
const fs = require('fs').promises;
const ObjectId = require('mongoose').Types.ObjectId

/**
 * Gestione delle email
 */
class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: IdEmail,
                pass: PasswordEMail
            }
        });
    }

    /**
     * Invia l'email per la conferma della password
     * @param {String} email Email alla quale inviare la conferma
     * @param {String} username Nuovo username dell'utente
     * @param callback Con il risultato dell'invio dell'email
     */
    async sendConfirmEmail(email, username, callback){
        await this.getCredentialsAndToken(email, EmailType.CONFIRM_EMAIL, false,true, async (err, credentials, token) => {
            if (err != null) {
                return callback(err);
            }
            const link = `${Host}api/client/confirm?token=${token}`
            // Invia l'email
            const filePath = path.join(__dirname, "../templates/confirmUserEmail.txt");
            let data = await fs.readFile(filePath, "utf-8");
            data = data.replace('$username', username).replace('$link', link);
            const mailOptions = new MailOptions(credentials.email, 'Gamery confirm account', data);
            this.sendEmail(credentials.user, EmailType.CONFIRM_EMAIL, mailOptions, async (err) => {
                if(err != null){
                    await Credentials.deleteOne({_id: new ObjectId(credentials._id)});
                }
                callback(err)
            });
        });
    }

    /**
     * Invia l'email per il reset della password
     * @param {String} email Email alla quale inviare la conferma
     * @param {String} username Username connesso all'utente
     * @param callback Callback con l'errore se lo trova
     */
    async sendPasswordReset(email, username, callback){
        await this.getCredentialsAndToken(email, EmailType.PASSWORD_RESET, true, false, async (err, credentials, token) => {
            if (err != null) {
                return callback(err);
            }
            // Invia l'email
            const link = `${Host}api/client/change/password?token=${token}`
            const filePath = path.join(__dirname, "../templates/passwordResetEmail.txt");
            let data = await fs.readFile(filePath, "utf-8");
            data = data.replace('$username', username).replace('$link', link);
            const mailOptions = new MailOptions(credentials.email, 'Gamery password reset', data);
            this.sendEmail(credentials.user, EmailType.PASSWORD_RESET, mailOptions, async (err) => {
                callback(err)
            });
        });
    }

    /**
     * Ottiene le credenziali e il token
     * @param {String} email Email al quale inviare i dati
     * @param {Number} type Tipo di email da inviare
     * @param {Boolean} needConfirm Indica se ha bisogna della conferma dell'account per continuare
     * @param {Boolean} deleteWithError Indica se eliminare le credenziali in caso di errore
     * @param callback Callback con i dati ed l'errore in prima posizione se lo trova
     * @return {Promise<*>}
     */
    async getCredentialsAndToken(email, type, needConfirm=true, deleteWithError=true, callback) {
        // Controlli sulla conferma
        const credentials = await Credentials.findOne({email: email}).populate('user').exec();
        if (credentials == null) {
            return callback("Email not valid", null, null);
        }
        if (credentials.confirm && !needConfirm) {
            return callback("Credentials already confirmed", null, null);
        }
        if (!credentials.confirm && needConfirm) {
            return callback("Credentials have to confirmed for this action", null, null);
        }
        Token.createTokenEmail(credentials.user._id.toString(), EmailType.CONFIRM_EMAIL, async (err, token) => {
            if (err != null){
                if (deleteWithError) {
                    await Credentials.deleteOne({_id: new ObjectId(credentials._id)});
                }
                return callback(err, null, null);
            }
            // Registra il token sulle credenziali
            credentials.token.value = token
            credentials.token.active = true
            credentials.token.type = type
            await credentials.save()
            // Ritorna i dati
            return callback(null, credentials, token)
        });
    }

    /**
     * Invia un'email
     * @param {any} user Utente che invia l'email
     * @param {Number} emailType Tipo di email da inviare
     * @param {MailOptions} options Opzioni dell'email per l'invio
     * @param callback Funzione di callback che se trova un errore lo ritorna sennò null
     */
    sendEmail(user, emailType, options, callback) {
        const mailOptions = options.getDictionary();
        this.transporter.sendMail(mailOptions, async function (err, info) {
            if (err){
                return callback(err);
            }
            // Salva il fatto di aver inviato un'email
            const newEmailDB = new EmailDB({user: user._id, apiId: info.messageId, type: emailType});
            await newEmailDB.save();
            callback(null);
        })
    }
}

class MailOptions {

    /**
     * Costruisce l'elemento
     * @param {String} to
     * @param {String} subject
     * @param {String} text
     */
    constructor(to, subject, text) {
        this.from = IdEmail;
        this.to = to;
        this.subject = subject;
        this.text = text;
    }

    /**
     * Converte la classe in un dizionario
     */
    getDictionary() {
        return {
            from: this.from,
            to: this.to,
            subject: this.subject,
            text: this.text
        }
    }
}
// Istanza della classe
const emailManager = new EmailManager();
// Viene ritornata solo l'istanza in modo da creare una sola volta il componente
module.exports = emailManager;
