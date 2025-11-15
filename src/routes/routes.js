const express = require('express'); 
const router = express.Router(); 

const ewerton = require('./ewerton'); 

router.use('/', ewerton);

module.exports = router;

