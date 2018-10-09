let express = require('express');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const app = express()
let config = require('./config/config')[env];

require('./config/express')(app, config);
require('./config/mongoose')(config);

require('./models/Users');

require('./config/passport')();
require('./config/routes')(app);


app.listen(config.port, () => {
    console.log(`Example app listening on port ${port}!`)
}, (err) => {
    if (err) throw err;
    console.log("listening to the port :" + config.port);
});

// app.get('/', (req, res) => res.send('Hello World!'))
// app.get('/getMessage', (req, res) => res.send('Hello World shagul!'))

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))