const express = require('express')
const mongoose = require('mongoose')
const { createSeat, createManySeats,getSeatsByScreen } = require('../services/SeatService')
const Seat = require('../models/Seat')
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
    console.log("\n=== POST /Seats START ===");
    console.log("Controller received", req.body.length, "seats");
    try{
        const result = await createManySeats(req.body)
        console.log("=== POST /Seats END (SUCCESS) ===\n");
        return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("❌ Something went wrong while creating bulk seats:", err.message);
        console.log("=== POST /Seats END (ERROR) ===\n");
        return res.status(500).send({error: err.message, stack: err.stack})
    }
})


router.get("/seats/:screenId",async(req,res)=>{
    try{
    const result = await getSeatsByScreen(req.params.screenId)
    console.log(`SeatController: Retrieved ${result.data.data.length} seats for screen ${req.params.screenId}`);
    return res.status(result.status).send(result.data.data)
    }catch(err){
        console.log("Something went wrong while fetching seats by screen",err);
        return res.status(500).send(err)        
    }
})

router.get("/verify", async (req, res) => {
    try {
        console.log("\n=== DIAGNOSTIC CHECK ===");
        
        // Check connection
        console.log("MongoDB connection state:", mongoose.connection.readyState);
        console.log("  0 = disconnected");
        console.log("  1 = connected");
        console.log("  2 = connecting");
        console.log("  3 = disconnecting");
        
        const dbName = mongoose.connection.db?.databaseName;
        console.log("Database name:", dbName);
        
        // Get collection info
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in DB:", collections.map(c => c.name));
        
        // Count seats
        const count = await Seat.countDocuments();
        console.log("Total documents in 'seats' collection:", count);
        
        // Sample data
        const samples = await Seat.find().limit(3).lean();
        console.log("Sample data:", samples);
        
        console.log("=== END DIAGNOSTIC ===\n");
        
        res.send({ 
            connection: {
                state: mongoose.connection.readyState,
                database: dbName
            },
            collections: collections.map(c => c.name),
            seats: {
                total: count,
                samples: samples
            }
        });
    } catch (err) {
        console.error("❌ Diagnostic error:", err.message);
        res.status(500).send({ error: err.message, stack: err.stack });
    }
})

module.exports = router