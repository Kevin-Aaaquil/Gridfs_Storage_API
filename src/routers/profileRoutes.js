const express = require('express')
const profile = express.Router();
const passport = require('passport')
const logger = require('../../logs/logger.js')
const methodOveride = require('method-override')
const {init} = require('../login/signIn.js')
//const {init} = require('../../test.js')
init();
const profileController = require('../controllers/profileController.js')


profile
.use(passport.initialize())
.use(passport.session())
.use(methodOveride('_method'))

profile.post('/view',checkAuthenticated,async (req,res)=>{
    profileController.getProfile(req.user.id.toString())
    .then((data)=>{
        delete data._id; delete data.id;
        res.status(200).json({status:"ok",data:data})
    })
    .catch(err=>{
        res.status(404).json({code:err.status, success:err.success, message : err.message})
    })
})




profile.put('/update',checkAuthenticated, async (req,res)=>{
profileController.updateProfile(req.user.id.toString(),req.body)
.then(()=>{
    res.status(200).json({code:200, success:true, message:"Profile updated"})
})
.catch((err)=>{
    res.status(404).json({code:err.status, success:err.success, message : err.message})
})
})






function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.json({status:"error",message:"user is already logged in"})
    }
    next();
}

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.json({status:"error",message:"not logged in"})
}

module.exports = {profile};