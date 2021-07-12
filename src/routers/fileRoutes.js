const express = require('express')
const  file = express.Router();
const logger = require('../../logs/logger.js')
const passport = require('passport')
const methodOveride = require('method-override')
const {init} = require('../login/signIn.js')
//const {init} = require('../../test.js')
init();
const {GridFsStorage} = require('multer-gridfs-storage');
const multer = require('multer')
const filesController  = require('../controllers/filesController');
const nanoid = require('nanoid')

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    file: (req,file)=>{
        return new Promise((resolve,reject)=>{
            //encrypt filename before storing it
            const filename =nanoid.nanoid(10)+"--"+file.originalname;
            const fileInfo = {
                filename:filename,
                bucketName : 'uploads',
                aliases : req.user.id,
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({storage});

file
.use(passport.initialize())
.use(passport.session())
.use(methodOveride('_method'))

file.post('/upload',checkAuthenticated,upload.single('file'),(req,res)=>{
res.json({status:"ok",message:"file uploaded"})
})

// shows json of all files
file.post('/viewall',checkAuthenticated,(req,res)=>{
filesController.viewAll(req.user.id.toString())
.then((files)=>{
    res.status(200).json(files)
})
.catch((err)=>{
    res.status(404).json({code:err.status, success:err.success, message : err.message})
})
})

// opens file in browser
file.post('/view/file',checkAuthenticated,(req,res)=>{
    filesController.showOne(req.user.id.toString(),req.body.filename.toString())
    .then((obj)=>{
        if(obj.file.contentType === 'image/jpeg' || obj.file.contentType === 'image/png' || obj.file.contentType === 'application/pdf'){
        // const readstream = filesController.gfs.createReadStream(file.filename);
        // readstream.pipe(res);
        // console.log(obj.file.filename)
        obj.readstream.pipe(res);
        }
        else{
            throw {status : 500, success:false, message:"cannot initialize file"}
        }
        
    })
    .catch((err)=>{
        res.status(404).json({code:err.status, success:err.success, message : err.message})
    })
})

// test file for thumbnail
file.get('/view/file',checkAuthenticated,(req,res)=>{
    filesController.showOne(req.user.id.toString(),req.query.filename.toString())
    .then((obj)=>{
        if(obj.file.contentType === 'image/jpeg' || obj.file.contentType === 'img/png' || obj.file.contentType === 'application/pdf'){
        // const readstream = filesController.gfs.createReadStream(file.filename);
        // readstream.pipe(res);
        // console.log(obj.file.filename)
        obj.readstream.pipe(res);
        }
        else{
            throw {status : 500, success:false, message:"cannot initialize file"}
        }
        
    })
    .catch((err)=>{
        res.status(404).json({code:err.status, success:err.success, message : err.message})
    })
})

// shows json of one file
file.post('/view/filejson',checkAuthenticated,(req,res)=>{
    filesController.viewOne(req.user.id.toString(),req.body.filename.toString())
    .then((file)=>{
        res.status(200).json(file)
        })     
    .catch((err)=>{
        res.status(404).json({code:err.status, success:err.success, message : err.message})
    })
})

// delete one file
file.delete('/delete/file',checkAuthenticated,(req,res)=>{
    filesController.deleteFile(req.user.id.toString(),req.body.filename.toString())
    .then((obj)=>{
        if(obj.action === "file deleted"){
            res.status(200).json({success:true, message:"file deleted"})
        }
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

module.exports = {file};