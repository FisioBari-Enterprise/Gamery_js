let express = require("express");
const StaticFunctions = require("../static");
const { saveWords } = require('../classes/game/words');
const Token = require("../classes/token");
const SingleGameDB = require('../database/game/singleGame');
let router = express.Router();

//ENDPOINT per il caricamento delle parole. Disponibile solo il localhost
router.post('/word/create', function (req, res, next) {
    if (req.socket.remoteAddress !== "::1") {
        return StaticFunctions.sendError(res, 'This ip haven\'t the access to the endpoint');
    }
    next();
}, async function (req, res) {
    return await saveWords(res, req.body.words);
});
//Info dell'ultima partita creata
router.get('', Token.autenticateUser, async function (req, res) {
   const doc = await SingleGameDB.findOne().sort('-createdAt').lean().exec();
   if (doc === null) {
       return StaticFunctions.sendError(res, 'Nessuna partita trovata');
   }
   StaticFunctions.sendSuccess(res, doc);
});

module.exports = router
