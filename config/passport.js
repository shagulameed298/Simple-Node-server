const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

module.exports = () => {
    // passport.use(new LocalStrategy({
    //     usernameField: 'user[email]',
    //     passwordField: 'user[password]',
    // }, (email, password, done) => {
    //     Users.findOne({ email })
    //         .then((user) => {
    //             if (!user || !user.validatePassword(password)) {
    //                 return done(null, false, { errors: { 'email or password': 'is invalid' } });
    //             }
    //             return done(null, user);
    //         }).catch(done);
    // }));

    passport.use(new LocalStrategy({
        usernameField: 'user[email]',
        passwordField: 'user[password]',
    }, (email, password, done) => {
        Users.findOne({ email }, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Invalid credential.' });
            // return done(null, user);
            user.comparePassword(password, (err, isMatch) => {
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}