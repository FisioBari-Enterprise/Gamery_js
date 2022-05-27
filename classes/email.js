const nodemailer = require("nodemailer");
const {IdEmail, PasswordEMail} = require("../config");
const EmailDB = require("../database/users/email");

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
     * @param user
     */
    sendConfirmEmail(user){

    }

    /**
     * Invia l'email per il reset della password
     * @param user
     */
    sendPasswordReset(user){

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
            const newEmailDB = new EmailDB({user: user._id, apiId: info.messageId, type: emailType});
            await newEmailDB.save();
            callback(null);
        })
    }
}

class MailOptions {

    /**
     * Costruisce l'elemento
     * @param {String} from
     * @param {String} to
     * @param {String} subject
     * @param {String} text
     */
    constructor(from, to, subject, text) {
        this.from = from;
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
