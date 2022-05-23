let express = require("express");
let router = express.Router();
const words = require('../database/game/word');
const StaticFunctions = require("../static");

router.get("", async function (req, res, next) {
    StaticFunctions.sendSuccess(res, require('crypto').randomBytes(64).toString('hex'));
});

module.exports = router
