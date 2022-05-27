const nodemailer = require("nodemailer");
const {IdEmail, PasswordEMail, Host, TokenEmail} = require("../config");
const EmailDB = require("../database/users/email");
const Credentials = require("../database/users/credentials");
const path = require("path");
const EmailType = require("../database/enum/emailType");
const Token = require("./token");
const fs = require('fs').promises;

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
     * @param callback Con il risultato dell'invio dell'email
     */
    async sendConfirmEmail(email, callback){
        // Controlli sulla conferma
        /*const credentials = await Credentials.findOne({email: email}).exec();
        if (credentials == null) {
            throw "Email not valid";
        }
        if (!credentials.confirm) {
            throw "Credentials already confirmed";
        }*/
        // Genera il token ed il link per il reset
        //const credentials = {user: {_id: '1'}}
        //`${Host}api/password/reset`
        // Invia l'email
        const filePath = path.join(__dirname, "../static/confirmUserEmail.txt");
        let data = await fs.readFile(filePath, "utf-8");
        data = data.replace('$username', 'TestUser').replace('$link', ``);
        const mailOptions = new MailOptions('leonardolazzarin14@gmail.com', 'Gamery password reset', data);
        this.sendEmail('', EmailType.CONFIRM_EMAIL, mailOptions, (err) => callback(err));
    }

    /**
     * Invia l'email per il reset della password
     * @param {String} email Email alla quale inviare la conferma
     */
    sendPasswordReset(email){

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
                callback(err);
            }
            // Salva il fatto di aver inviato un'email
            //const newEmailDB = new EmailDB({user: user._id, apiId: info.messageId, type: emailType});
            //await newEmailDB.save();
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

module.exports = {
    EmailManager,
    MailOptions
}
