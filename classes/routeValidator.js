/**
 * Controlla se la richiesta è per un aggiornamento della pagina di frontend
 * @param {Request} req
 * @param {Response} res
 * @param next
 */
function routeValidator(req, res, next) {
    let url = req.originalUrl.toString();
    // Nel caso del backend non ha trovato un endpoint valido
    if (url.includes('/api/')) {
        return next();
    }
    // Ha già effettuato un tentativo di redirect
    if (req.query.path != null) {
        return next();
    }
    // Rimuove il primo /
    url = url.substring(1, url.length);
    // Effettua il redirect
    res.writeHead(301, {
        Location: `${req.protocol}://${req.get('host')}?path=${url}`
    }).end();
}

module.exports = routeValidator;
