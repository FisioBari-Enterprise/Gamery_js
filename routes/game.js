let express = require("express");
const StaticFunctions = require("../static");
const { saveWords } = require('../classes/game/words');
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

module.exports = router
