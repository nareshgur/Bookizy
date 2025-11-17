const express = require('express')
const router = express.Router()
const {register,login} = require('../services/AuthServices')

router.post("/register", async (req,res)=>{
    try{
        console.log("The data received in Auth Controller ",req.body);
        const result = await register(req.body)
        return res.status(result.status).send(result.data)
    }catch(ex){
        console.log("Error in registering",ex);
        return res.status(500).send("Internal Server Error")
    }
})



router.post("/login",async (req,res)=>{
    try{
        const result = await login(req.body)
        console.log("The login method is called with result",JSON.stringify(result));
        return res.header('x-auth-header',result.data.token).status(result.status).send({message:result.message,data:result.data})
        
    }catch(err){
        console.log("Something went wrong in the login controller ",err);
        return res.status(500).send({message:"Internal server error"})
    }
})

module.exports = router

