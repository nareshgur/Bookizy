const { required } = require('joi')
const mongoose = require('mongoose')


const Theatre = mongoose.model("Theatre", new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    address:{
        type:String,
        required:true
    },
    cityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'City',
        required:true
    },
    features:{
        type:[String],
        default:[]
    }
},{timestamps:true}))


exports.Theatre = Theatre