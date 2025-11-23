const mongoose = require("mongoose")
const JOI = require('joi')

const User = mongoose.model("User",new mongoose.Schema({
    name:{
        type:String,
        minlength:3,
        maxlength:30,
        required:true
    },
    email:{
        type:String,
        minlength:10,
        maxlength:50,
        unique:true,
        required:true
    },
    phone:{
        type:String,
        required:true,
        minlength:6,
        maxlength:20,
    },
    Password:{
        type:String,
        minlength:8,
        maxlength:100,
        required:true
    }
}))


exports.User = User;