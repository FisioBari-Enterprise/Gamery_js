let bcrypt = require('bcrypt');

exports.cryptPassword = function(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        if (err)
            return callback(err, null);

        bcrypt.hash(password, salt, function(err, hash) {
            return callback(err, hash);
        });
    });
};

exports.comparePassword = function(plainPass, hashWord, callback) {
    bcrypt.compare(plainPass, hashWord, function(err, isPasswordMatch) {
        return err == null ?
            callback(null, isPasswordMatch) :
            callback(err, null);
    });
};
