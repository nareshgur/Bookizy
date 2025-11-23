const bcrypt = require("bcrypt")
const {User} = require('../models/User');
const { loggers } = require("winston");
const mongoose = require('mongoose');
const jwt= require("jsonwebtoken")
exports.register = async (body)=>{
    console.log("The data is received in Auth Service",body);

    console.log("Register: checking user in DB:", mongoose.connection.db.databaseName);

    const isExists =await User.findOne({email:body.email});

    if(isExists) return {status : 400, data:"User already exists"}

    const salt = await bcrypt.genSalt(10)
    console.log("Salt generated is ",salt);
    
    const hashedPassword = await bcrypt.hash(body.Password,salt)
    const user = new User({
        name:body.name,
        email:body.email,
        phone:body.phone,
        Password:hashedPassword
    })

    await user.save();

    return {status:200, data:{message:"Registered User Succesfully"}}
    
}

exports.login = async ({email,Password}) =>{
    const user = await User.findOne({email:email})
    console.log("The data we received to teh login service method is ",email,Password);
    
    if(!user) return {status:400, data:"Invalid password or email"}

    const validPassword = await bcrypt.compare(Password,user.Password)
    if(!validPassword) return {status:400, data:"Invalid email or password"}

    const token = await jwt.sign({
        _id:user._id,email:user.email
    },process.env.jwtPrivateKey)

    return {status:200, message:"Login succesful",data:{token,user}}
}



