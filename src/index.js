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


app.get('/ami',(req,res)=>{
    function format(seconds){
        function pad(s){
          return (s < 10 ? '0' : '') + s;
        }
        var hours = Math.floor(seconds / (60*60));
        var minutes = Math.floor(seconds % (60*60) / 60);
        var seconds = Math.floor(seconds % 60);
      
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      }
      
      var uptime = process.uptime();
    res.json({status:"ok",message:"connected",uptime:format(uptime)})
})




app.use((req,res,next)=>{
    res.send('<h1> 404: Page not found </h1>')
})






// listening
app.listen(PORT, () => logger.info(`http://localhost:${PORT}`))
