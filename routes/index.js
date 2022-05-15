let express = require("express");
let router = express.Router();

router.get("", async function (req, res, next) {
    res.status(200).json({data: true});
});

module.exports = router
