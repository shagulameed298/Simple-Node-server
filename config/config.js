const path = require('path')
const rootpath = path.normalize(__dirname + '/../');

module.exports = {
    development: {
        rootpath: rootpath,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/first-app',
        port: process.env.PORT || 3030
    },
    production: {
        rootPath: rootpath,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/first-app',
        port: process.env.PORT || 80
    }
}