const { City } = require('../models/City')
const {createCity} = require('../services/CityService')
const express = require('express')
const router = express.Router()

router.post("/city", async (req,res)=>{
    try{
        const result = await createCity(req.body)
        return res.status(result.status).send(result.data)
    }catch(err){
        console.log("Something went wrong while creating the city",err);
        return res.status(500).send("Internal Server error",err)
        
    }
})


router.get("/cities", async (req,res)=>{
    try{
        const cities = await City.find()

        if(!cities) return res.status(404).send("No Cities Exists")
            
        res.status(200).send({data:cities})
    }catch(err){
        console.log("Not able to fetch cities",err);
        return res.status(500).send({message:err})
        
    }
})


router.get("/:id", async (req,res)=>{
    try{
        const city = await City.find({_id:req.params.id})

        if(!city) return res.status(404).send("No Cities Exists")
            
        res.status(200).send({data:city})
    }catch(err){
        console.log("Not able to fetch cities",err);
        return res.status(500).send({message:err})
        
    }
})

router.get("/state/:state", async (req,res)=>{
    try{
        const cities = await City.find({state:req.params.state})

        if(!cities) return res.status(404).send("No cities are found")

        return res.status(200).send({data:cities})
    }catch(err){
        console.log("SOmething went wrong while fetching the cities based on the State",err);
        return res.status(500).send({message:err})
        
    }
})




module.exports = router