const {Theatre} = require('../models/Theatre')


exports.createTheatre = async (body)=>{
    const result = await Theatre.create(body)

    return {status:200, data:{message:"Succesfully created the Theatre",data:result}}
}