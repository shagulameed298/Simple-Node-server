const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
//POST new user route (optional, everyone has access)
router.post('/signUp', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }
    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }
    const finalUser = new Users(user);

    // finalUser.setPassword(user.password);

    return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));
});
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express',
        user: req.user
    });
});
router.get('/loginPage', function(req, res) {
    res.render('login', {
        user: req.user
    });
});
router.get('/signupPage', function(req, res) {
    res.render('signup', {
        user: req.user
    });
});
router.get('/forgot', function(req, res) {
    res.render('forgot', {
        user: req.user
    });
});
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {

    console.log(req);
    const { body: { user } } = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }
        if (!passportUser) {
            return res.status(401).json({
                err: info
            });
        }
        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();
            req.logIn(user, function(err) {
                if (err) {
                    return res.status(500).json({
                        err: 'Could not log in user'
                    });
                }
                return res.status(200).json({
                    status: 'Login successful!',
                    user: user.toAuthJSON()
                });
            });
            // return res.json({ user: user.toAuthJSON() });
        }
        return res.status(400).info;
    })(req, res, next);
});
router.get('/reset/:token', function(req, res) {
    Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {

    // let id = req.params.id;
    const { payload: { id } } = req;
    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }
            return res.json({ user: user.toAuthJSON() });
        });
});


router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            Users.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    // req.flash('error', 'No account with that email address exists.');
                    // return res.redirect('/forgot');

                    return res.status(401).json({
                        status: true,
                        message: 'No account with that email address exists.'
                    });
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            // var smtpTransport = nodemailer.createTransport('SMTP', {
            //     service: 'SendGrid',
            //     auth: {
            //         user: 'shagul298@gmail.com',
            //         pass: 'shagulam'
            //     }
            // });

            var smtpTransport = nodemailer.createTransport({
                service: 'gmail', // sets automatically host, port and connection security settings
                port: 587,
                secure: false,
                auth: {
                    user: "shagul298@gmail.com",
                    pass: "shagulam"
                }
            });
            // let smtpTransport = nodemailer.createTransport({
            //     host: 'smtp.ethereal.email',
            //     port: 587,
            //     secure: false, // true for 465, false for other ports
            //     auth: {
            //         user: "shagul298@gmail.com",
            //         pass: "shagulam"
            //     }
            // });

            //var smtpTransport = nodemailer.createTransport("smtps://shagul298@gmail.com:" + encodeURIComponent('shagulam') + "@smtp.gmail.com:465");
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/api/users/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
            return res.status(200).json({
                status: true,
                message: 'Email sent successful!'
            });
        }
    ], function(err) {
        if (err) return next(err);
        // res.redirect('/forgot');
        res.status(201).json({
            status: false,
            err: "error occured"
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail', // sets automatically host, port and connection security settings
                port: 587,
                secure: false,
                auth: {
                    user: "shagul298@gmail.com",
                    pass: "shagulam"
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        // res.redirect('/');
    });
});

module.exports = router;