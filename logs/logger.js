const buildDevLog = require('./DEVlogger.js');
const buildProdLog = require('./PRODlogger.js')
require('dotenv').config();
let logger = null ; 
if(process.env.NODE_ENV === 'development'){
    logger = buildDevLog();
}
else {
    logger = buildProdLog();
}


module.exports = logger;