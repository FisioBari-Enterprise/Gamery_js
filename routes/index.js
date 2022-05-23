let express = require("express");
let router = express.Router();
const words = require('../database/game/word');
const StaticFunctions = require("../static");

router.get("", async function (req, res, next) {
    const allWords = await words.find().lean().exec();
    StaticFunctions.sendSuccess(res, allWords);
});

module.exports = router
