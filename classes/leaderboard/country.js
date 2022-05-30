const CountryModel = require('../../database/users/country');
const StaticFunctions = require("../../static");

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
        return await CountryModel.find({}).sort({code: 1}).lean().exec();
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
