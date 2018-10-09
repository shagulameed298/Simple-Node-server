const express = require('express');
const router = express.Router();
const test = require('./test');

router.use('/api', require('./api'));
router.use('/api1', test.Get);

module.exports = router;