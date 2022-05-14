let express = require("express");
const SessionModel = require('../database/users/session');
let router = express.Router();

router.get("", async function (req, res, next) {
    res.status(200).json({data: true});
});

module.exports = router
