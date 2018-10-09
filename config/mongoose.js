const mongoose = require('mongoose');

module.exports = (config) => {
    mongoose.connect(config.MONGO_URI, { promiseLibrary: global.Promise });
    const mongoDb = mongoose.connection;

    mongoDb.on('error', function() {
        console.error('MongoDB Connection Error. Please make sure that', config.MONGO_URI.slice(config.MONGO_URI.lastIndexOf("/") + 1, config.MONGO_URI.length), 'is running.');
    });

    mongoDb.once('open', function callback() {
        console.info('Connected to MongoDB:', config.MONGO_URI.slice(config.MONGO_URI.lastIndexOf("/") + 1, config.MONGO_URI.length));
    });



}