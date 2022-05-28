module.exports = class Languages {
    static IT = 0
    static EN = 1

    /**
     * Ottiene i campi in base al tipo
     * @param {Number} type Tipo di linguaggio
     * @return {String[]} pos 0: chiave per il nome. pos 1: chiave per la lunghezza
     */
    static getWordFields(type) {
        switch (type) {
            case Languages.IT: return ['it', 'it_length'];
            case Languages.EN: return ['en', 'en_length'];
            default: throw new Error("Language type not supported");
        }
    }

    /**
     * Converte in stringa il tipo
     * @param {Number} type Tipo scelto
     */
    static typeString(type) {
        switch (type) {
            case Languages.IT: return 'IT';
            case Languages.EN: return 'EN';
            default: throw new Error("Language type not supported");
        }
    }
}
