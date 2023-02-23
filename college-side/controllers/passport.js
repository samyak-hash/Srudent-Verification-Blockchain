var localStrategy = require('passport-local').Strategy;
const admin = require('../models/adminmodel');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'username' }, (username, password, done) => {
        admin.findOne({ username : username }, (err, data) => {
            if (err) throw err;
            if (!data) {
                return done(null, false, { message: "User Doesn't Exists.." });
            }
            bcrypt.compare(password, data.password, (err, match) => {
                if (err) {
                    return done(null, false);
                }
                if (!match) {
                    return done(null, false, { message: "Password Doesn't Match" });
                }
                if (match) {
                    return done(null, data);
                }
            });
        });
    }));

    passport.serializeUser(function (admin, cb) {
        cb(null, admin.id);
    });

    passport.deserializeUser(function (id, cb) {
        admin.findById(id, function (err, admin) {
            cb(err, admin);
        });
    });
}
// ---------------
// end of autentication statregy