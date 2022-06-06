const CountryModel = require('../../database/users/country');
const UserModel = require("../../database/users/user");
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Classe per la gestione degli stati possibili
 */
class Country {
    /**
     * Costruttore
     * @param {*} user Utente di riferimento opzionale
     */
    constructor(user=null) {
        this.user = user;
    }

    /**
     * Ottiene tutti gli stati attualmente salvati
     */
    async getAll() {
        return await CountryModel.find({}).sort({name: 1}).lean().exec();
    }

    /**
     * Ottiene lo stato assegnato all'utente
     */
    getCountryUser() {
        if (this.user == null) {
            throw "User not found";
        }
        return this.user.country;
    }

    /**
     * Aggiorna lo stato assegnato all'utente
     * @param {String | null} id L'id del nuovo stato
     * @param {String | null} code Il nome del nuovo stato
     * @return {Promise<void>}
     */
    async updateCountry(id, code) {
        // Controllo sull'utente
        if (this.user == null) {
            throw "User not found";
        }
        // Costruisce la query
        let query = {}
        if (id != null){
            query['_id'] = new ObjectId(id);
        }
        if (code != null) {
            query['code'] = code;
        }
        // Controllo sui dati
        if (query._id == null && query.code == null) {
            throw "No params found";
        }
        // Aggiorna il country
        const country = await CountryModel.findOne(query).lean().exec();
        if (country == null) {
            throw "Id or code not valid";
        }
        this.user.country = country._id;
        // Salva le modifiche
        await this.user.save()
        // Aggiorna l'utente
        this.user = await UserModel.findOne({_id: new ObjectId(this.user._id)}).populate('country').exec();
    }

    /**
     * Rimuove la preferenza dello stato dall'utente
     * @return {Promise<void>}
     */
    async removeCountry() {
        if (this.user == null) {
            throw "User not found";
        }
        // Aggiorna i dati
        this.user.country = null;
        await this.user.save();
    }
}

/**
 * Funzione di aggiornamento degli stati salvati nel DB
 * @param {*} countries Array di dizionari che deve contenere la chiave code e flag
 * @return {Promise<void>}
 */
async function updateCountries(countries) {
    // Controllo sui dati
    if (countries == null) {
        throw "Countries not valid";
    }
    if(Object.prototype.toString.call(countries) !== '[object Array]') {
        throw "Countries have to be an array";
    }
    // Ottiene tutti i codici che attualmente sono salvati
    const codeSaved = (await CountryModel.find({}).lean().exec()).map(item => item.code);
    // Salva i nuovi dati controllando che non esistano già e controllo che i dati abbiano i campi corretti
    let toInsert = [];
    for (const country of countries) {
        if (country.name == null || country.code == null) {
            throw "Countries malformed";
        }
        // Controllo che non siano già presenti
        if (!codeSaved.includes(country.code)) {
            toInsert.push({code: country.code, name: country.name});
        }
    }
    // Aggiorno i dati nel DB
    await CountryModel.insertMany(toInsert);
}

module.exports = {
    Country,
    updateCountries
}
