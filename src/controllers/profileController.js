const logger = require('../../logs/logger.js')
const DB = require('../db.js')

const updateProfile = async (reqID,body)=>{
//console.log({id:reqID,body:body})
if(!body.name || !body.email){
    throw {status:404, success:false, message:"name and email are mandatory"}
}
let old =await (await DB()).collection("profile").findOne({id:reqID})
let dataProfile = body;
dataProfile.id = reqID;
await (await DB()).collection("profile").replaceOne({id:reqID},dataProfile,(err)=>{
   if(err){
    throw {status : 500, success : false, message:"SERVER ERROR: Could not update profile"}
   }
})


// let dataCred = await (await DB()).collection("credentials").findOne({id:reqID})
// dataCred.name = body.name;
// dataCred.email = body.email;


// await (await DB()).collection("credentials").replaceOne({id:reqID},dataCred, async (err)=>{
//     if(err)
//     {
//         await (await DB()).collection("profile").replaceOne({id:reqID},old);
//     throw {status : 500, success : false, message:"SERVER ERROR: Could not update credentials"}

//     }
// })
}

const getProfile = async (reqID)=>{
    let profile = await (await DB()).collection("profile").findOne({id:reqID})
    return profile;

}


module.exports = {updateProfile,getProfile}