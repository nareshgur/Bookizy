const mongoose = require('mongoose')


const City = mongoose.model("City",
    new mongoose.Schema({
        name:{
            type:String,
            unique:true,
            required:true,
            trim:true
        },
        state:{
            type:String,
            required:true,
            trim:true
        },
        
    },{timestamps:true})
)

exports.City = City