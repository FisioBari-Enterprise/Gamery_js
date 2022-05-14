/**
 * Funzioni statiche utili in tutto il codice
 */
class StaticFunctions {
    /**
     * Invia una risposta di errore
     * @param {Response} res La risposta da inviare
     * @param {String} error Errore da inoltrare
     * @param {number} code Codice dell'errore
     */
    static sendError(res, error, code=400) {
        return res.status(code).json({'error': error});
    }

    /**
     * Invia una risposta
     * @param {Response} res Risposta da inviare
     * @param {*} data Dati da inviare nella risposta
     * @param {number} code Codice della risposta
     */
    static sendSuccess(res, data, code=200) {
        return res.status(code).json({data: data});
    }
}

module.exports = StaticFunctions
