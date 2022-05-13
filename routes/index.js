let express = require("express");
let User = require('../classes/users/user');
let router = express.Router();

router.get("", function (req, res, next) {
    next()
}, async function (req, res, next) {
    const user = new User();
    await user.findById('627d15aba4d281b7b13327a0');
    if (user.user === null) {
        res.status(400).json({ error: 'User not found' });
    } else {
        res.status(200).json(user.user);
    }
});

module.exports = router
