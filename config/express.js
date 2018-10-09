const express = require('express'),

    logger = require('morgan'),
    bodyparser = require('body-parser'),
    cors = require('cors'),
    session = require('express-session'),
    nodemailer = require('nodemailer');
passport = require('passport'),
    bcrypt = require('bcrypt-nodejs');
async = require('async');
crypto = require('crypto');
flash = require('express-flash');
errorHandler = require('errorhandler');

const path = require('path')
let isProduction = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const errorHandlerHelper = require('./error-handler');
// passport = require('passport');

module.exports = (app, config) => {
    app.use(logger('dev'));
    app.use(cors());
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(bodyparser.json());
    app.set('port', config.port);
    app.set('views', path.normalize(__dirname + '/../') + '/views');
    app.set('view engine', 'jade');
    //app.use(passport.initialize());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/public', express.static(config.rootPath + 'public'));
    app.use(session({ secret: 'passport-firsttutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
    app.use(errorHandlerHelper);
    app.use(flash());
    if (!isProduction) {
        app.use(errorHandler());
    }
    // if (!isProduction) {
    //     app.use((err, req, res) => {
    //         res.status(err.status || 500);

    //         res.json({
    //             errors: {
    //                 message: err.message,
    //                 error: err,
    //             },
    //         });
    //     });
    // }

    // app.use((err, req, response) => {
    //     // res.status(err.status || 500);

    //     response.json({
    //         errors: {
    //             message: err.message,
    //             error: {},
    //         },
    //     });
    // });
}