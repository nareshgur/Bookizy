const express= require('express')
const { CreateScreen , getScreensByTheatre,updateScreen} = require('../services/ScreenService')
const router = express.Router()


router.post("/Screen", async (req,res)=>{
    try{
        const result  = await CreateScreen(req.body)
        return res.status(result.status).send({message:"Screen is created succesfully",data:result.data.data})
    }catch(err){
        console.log("Something went wrong while creating the screen",err);
        return res.status(500).send({message:err})
        
    }
})


router.get("/Screen/:TheatreId", async (req,res)=>{
    try{
        const result = await getScreensByTheatre(req.params.TheatreId)
        return res.status(result.status).send(result.data.data)        

    }catch(err){
        console.log("Something went wrong while fetching the Screens for theatre",err);
        return res.status()        
    }
})


router.put("/Screen/:ScreenId", async (req,res)=>{
    try{
        const result = await updateScreen(req.params.ScreenId,req.body)

        return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("Something went wrong while updating teh screen record",err);
        return res.status(500).send(err)        
    }
})

module.exports = router
