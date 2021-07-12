console.clear()
const express = require('express')
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000
const chalk = require('chalk');
const logger = require('../logs/logger.js')

const {signin} = require('./login/signIn.js')
//const {signin} = require('../test.js')
const {file} = require('./routers/fileRoutes.js')
const {profile} = require('./routers/profileRoutes.js')

// setting up cross origin middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// setting up routes
app
.use('/', signin)
.use('/files',file)
.use('/profile',profile)
// more routes to be added





app.use((req,res,next)=>{
    res.send('<h1> 404: Page not found </h1>')
})






// listening
app.listen(PORT, () => logger.info(`http://localhost:${PORT}`))