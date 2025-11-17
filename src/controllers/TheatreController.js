const express = require('express')
const { createTheatre } = require('../services/TheatreService')
const { Theatre } = require('../models/Theatre')
const router = express.Router()


router.post("/Theatre",async (req,res)=>{
    try{
        const result = await createTheatre(req.body)
        return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("Something went wrong while creating the Theatre",err);
        return res.status(500).send("Internal server error",err)
        
    }
})

router.get("/", async (req,res)=>{
    try{
        const result = await Theatre.find()
        
        if(!result) return res.status(404).send("No Theatres found ")

        return res.status(200).send(result)
        
    }catch(err){
        console.log("Something went wrong while fetching the Theatres ",err);
        return res.status(500).send(err)
        
    }
})

module.exports = router