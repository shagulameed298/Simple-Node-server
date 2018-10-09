const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;


const UsersSchema = new Schema({
    email: String,
    salt: String,
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
UsersSchema.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.salt = salt
            user.password = hash;
            next();
        });
    });
});

UsersSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
    //     this.salt = crypto.randomBytes(16).toString('hex');
    //     this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex'); 
};

// UsersSchema.methods.setPassword = function(password) {
//     this.salt = crypto.randomBytes(16).toString('hex');
//     this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
// };

UsersSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

UsersSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        email: this.email,
        first_name: this.firstName,
        last_name: this.lastName,
        created_date: this.createdDate,
        token: this.generateJWT(),
    };
};

mongoose.model('Users', UsersSchema);