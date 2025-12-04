const express= require('express')
const logger = require('../utils/logger')
const { CreateScreen , getScreensByTheatre,updateScreen} = require('../services/ScreenService')
const router = express.Router()


router.post("/Screen", async (req,res)=>{
    try{
        const result  = await CreateScreen(req.body)
        logger.info("Screen created successfully", { theatreId: req.body.theatreId });
        return res.status(result.status).send({message:"Screen is created succesfully",data:result.data.data})
    }catch(err){
        logger.error("Error creating screen", { error: err.message });
        return res.status(500).send({message:err})
        
    }
})


router.get("/Screen/:TheatreId", async (req,res)=>{
    try{
        const result = await getScreensByTheatre(req.params.TheatreId)
        logger.info("Fetched screens by theatre", { theatreId: req.params.TheatreId, count: result?.data?.data?.length || 0 });
        return res.status(result.status).send(result.data.data)        

    }catch(err){
        logger.error("Error fetching screens by theatre", { theatreId: req.params.TheatreId, error: err.message });
        return res.status(500).send()        
    }
})


router.put("/Screen/:ScreenId", async (req,res)=>{
    try{
        const result = await updateScreen(req.params.ScreenId,req.body)
        logger.info("Screen updated successfully", { screenId: req.params.ScreenId });
        return res.status(result.status).send(result.data.data)
    }catch(err){
        logger.error("Error updating screen", { screenId: req.params.ScreenId, error: err.message });
        return res.status(500).send(err)        
    }
})

module.exports = router
