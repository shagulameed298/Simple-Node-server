const employees = require('../controllers/test');

module.exports = (app) => {
    // app.get('*', function(req, response) {
    //     response.send("index working");
    // })
    app.use(require('../controllers'))
}