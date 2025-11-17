const { City } = require("../models/City");


exports.createCity = async({name,state})=>{
    const isExists = await City.findOne({name:name})

    if(isExists) return {status:500,data:"City already exists"}

    const result = await City.create({name:name,state:state})

    return {status:200, data:{message:"City created Succesfully ",data:result}}
}