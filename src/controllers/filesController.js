require('dotenv').config();
const logger = require('../../logs/logger.js')
const Grid = require('gridfs-stream')
const mongoose = require('mongoose')
const DB = require('../db.js')

const connect  = mongoose.createConnection(process.env.MONGO_URI,{
    useFindAndModify:true,
    useNewUrlParser: true,
    useUnifiedTopology:true,
    ignoreUndefined:true,
})

let gfs;

connect.then(()=>{
    logger.info('mongoose connected')
    gfs = Grid(connect.db, mongoose.mongo);
    gfs.collection('uploads')
}).catch(err => logger.error(new Error (err.message)));


// return json array of all files present
const viewAll = (reqAliases) =>{
    return new Promise((resolve,reject)=>{
        gfs.files.find({aliases:reqAliases}).toArray((err,files)=>{
            if(!files || files.length === 0){
                return reject ({status : 404, success: false, message : "No files for this user"})
            }
            files.forEach(obj =>{
                delete obj._id;
                delete obj.aliases;
                delete obj.md5;
                delete obj.chunkSize;

            })
            return resolve(files)
        })
    })
}

// return json of one file
const viewOne = async (reqAliases,reqFilename)=>{
return await new Promise((resolve,reject)=>{
    gfs.files.findOne({aliases : reqAliases, filename : reqFilename},(err,file)=>{
        if(!file || file.length ===0){
            return reject ({status : 404, success: false, message : "No such file for this user"})
        }
        delete file._id;
        delete file.aliases;
        delete file.md5;
        delete file.chunkSize;
        return resolve(file) 
    })
})
}

// displays file in browser
const showOne = async (reqAliases,reqFilename)=>{
    let file ;
file =  await new Promise((resolve,reject)=>{
    gfs.files.findOne({aliases : reqAliases, filename : reqFilename},(err,file)=>{
        if(!file || file.length ===0){
            return reject ({status : 404, success: false, message : "No such file for this user"})
        }
        return resolve(file) 
    })
})
return {
    file : file,
    readstream : gfs.createReadStream(file.filename),
}
}

const deleteFile = async (reqAliases,reqFilename)=>{
return await new Promise((resolve,reject)=>{
    gfs.files.findOne({aliases : reqAliases, filename : reqFilename},async (err,file)=>{
        if(!file || file.length === 0){
            return reject ({status : 404, success: false, message : "No such file for this user"})
        }

        // let arr =  await (await DB()).collection("uploads.files").findOne({aliases:reqAliases,filename:reqFilename}).toArray()
        // arr.forEach(async obj =>{
        //     await (await DB()).collection("uploads.chunks").deleteMany({files_id : obj._id})
        // })
        let obj = await (await DB()).collection("uploads.files").findOne({aliases:reqAliases,filename:reqFilename})
        await (await DB()).collection("uploads.chunks").deleteMany({files_id:obj._id});

        gfs.files.remove({aliases : reqAliases, filename : reqFilename},(err,file)=>{
            if(err)
            return reject(err)
            return resolve({action : "file deleted"})
        })
    })
})
}



module.exports = {viewAll,viewOne,showOne,deleteFile,}