require('dotenv').config();
const express = require('express');
const signin = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOveride = require('method-override')
const chalk = require('chalk');
const DB = require('../db.js');
const { customAlphabet} =  require('nanoid');
const passwordValidator = require('password-validator');
const ObjectId = require("mongodb").ObjectID;

const initializePassport = require('./passport-config.js')
const init = ()=>{
    initializePassport(
        passport,
        async email => await (await DB()).collection('credentials').findOne({"email":email}),
        async id => await (await DB()).collection('credentials').findOne({"id":id}),
    )
}

init();

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',9);

DB().catch(err=>console.log(err) )

const schema = new passwordValidator();

schema
.is().min(8)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().symbols()
.has().not().spaces();

// using features
signin.use(express.json());
signin.use(express.urlencoded({extended:true}));
signin.use(flash());
signin.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
signin.use(passport.initialize());
signin.use(passport.session());
signin.use(methodOveride('_method'));

// signin.post('/login',checkNotAuthenticated,passport.authenticate('local',{
//     successMessage : {status:"ok",message:"login succesfull"},
//     failureMessage : {status:"error",message:"invalid email/password"},
//     failureFlash: false
// }))

signin.post('/login',checkNotAuthenticated, passport.authenticate('local'),(req,res)=>{
    if(req.user)
    return res.json({status:"ok",message:"login successfull"})
    else
    return res.json({status:"error",message:"login fail"})
})

signin.post('/register', checkNotAuthenticated, async (req, res,next) => {
    try {
         if(!req.body.name || !req.body.email || !req.body.cpassword || !req.body.password) 
         throw {code:404,message:"data incomplete",success:false}
        if(!(req.body.cpassword===req.body.password))
        throw{code:404,message:"password don't match",success:false}

        if(!schema.validate(req.body.password))
        throw {code:404,message:"not a valid password",success:false};

        if(await (await DB()).collection('credentials').findOne({"email":req.body.email}))
        throw {code:404,message:"email already exists",success:false}
        const hashedPassword = await bcrypt.hash(req.body.password, 16)

        const user = {
            id: nanoid(),
            name:req.body.name,
            email:req.body.email,
            password: hashedPassword,
        }
        await(await DB()).collection('credentials').insertOne(user);
        const profile = {
            id : user.id,
            name : req.body.name,
            email : req.body.email,
        }
        await (await DB()).collection('profile').insertOne(profile)
        //res.redirect('/login')
        res.json({status:"ok",message:"user registration successfull"})
    } catch(err) {
        
        res.status(err.code).json({ code: err.code, success: false, message: err.message });
        
    }
})

signin.delete('/logout',checkAuthenticated, (req, res) => {
    req.logOut()
    //res.redirect('/login') 
    res.json({status:"ok",message:"user logged out"})
})

signin.put('/edit',checkAuthenticated, async (req,res)=>{
try{
    
    if(!(await bcrypt.compare(req.body.old_password, req.user.password)))
    throw {code:404,message:"Incorrect Password",success:false}

    if(!(req.body.cnew_password===req.body.new_password))
    throw{code:404,message:"password don't match",success:false}

    if(!schema.validate(req.body.new_password))
    throw {code:404,message:"not a valid password",success:false};


    req.user.password = await bcrypt.hash(req.body.new_password,16)
    await (await DB()).collection('credentials').replaceOne({ "_id": new ObjectId(req.user._id) }, req.user);
    req.logOut();
    //res.redirect('/login');
    res.json({status:"ok",message:"password changed and user logged out"})
}catch(err){
    res.status(err.code).json({ code: err.code, success: false, message: err.message });
}
})


// DANGER!!!!!!
signin.delete('/delete',checkAuthenticated, async (req,res)=>{
   try{
    
    if(!(await bcrypt.compare(req.body.password,req.user.password)))
    throw {code:404,message:"Wrong Password",success:false};

    // delete chunks
   let arr =  await (await DB()).collection("uploads.files").find({aliases:req.user.id}).toArray()
    arr.forEach(async obj =>{
        await (await DB()).collection("uploads.chunks").deleteMany({files_id : obj._id})
    })

    
    // delete files
    await (await DB()).collection("uploads.files").deleteMany({"aliases":req.user.id})
    
    // delete profile

    await (await DB()).collection("profile").deleteMany({id : req.user.id});
    
    // delete credentials
    await (await DB()).collection("credentials").deleteMany({"id":req.user.id});
    
    
    req.logOut();
    //res.redirect('/login'); 
    res.json({status:"ok",message:"account deleted and user logged out"})

}catch(err){
    res.status(err.code).json({ code: err.code, success: false, message: err.message });
}
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

module.exports = {signin,init};