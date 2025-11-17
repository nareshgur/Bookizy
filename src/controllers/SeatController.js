const express = require('express')
const { createSeat, createManySeats,getSeatsByScreen } = require('../services/SeatService')
const router = express.Router()


router.post("/Seat",async(req,res)=>{
    try{
        const result = await createSeat(req.body)
        return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("SOmething went wrong while creating the seat ",err);
        return res.status(500).send(err)
        
    }
})

router.post("/Seats", async (req,res)=>{
    try{
        const result = await createManySeats(req.body.seats)
        return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("Something went wrong while creating bulk seats",err);
        return res.status(500).send(err)
    }
})


router.get("/seats/:screenId",async(req,res)=>{
    try{
    const result = await getSeatsByScreen(req.params.screenId)
    return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("Something went wrong while fetching seats by screen",err);
        return res.status(500).send(err)        
    }
})

module.exports = router