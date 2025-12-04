const express = require('express')
const mongoose = require('mongoose')
const logger = require('../utils/logger')
const { createSeat, createManySeats,getSeatsByScreen } = require('../services/SeatService')
const Seat = require('../models/Seat')
const router = express.Router()


router.post("/Seat",async(req,res)=>{
    try{
        const result = await createSeat(req.body)
        logger.info("Seat created successfully", { seatNumber: req.body.seatNumber });
        return res.status(result.status).send(result.data.data)
    }catch(err){
        logger.error("Error creating seat", { error: err.message });
        return res.status(500).send(err)
        
    }
})

router.post("/Seats", async (req,res)=>{
    logger.info("Bulk seat creation request received", { count: req.body.length });
    try{
        const result = await createManySeats(req.body)
        logger.info("Bulk seats created successfully", { count: result.data.data.length });
        return res.status(result.status).send(result.data.data)
    }catch(err){
        logger.error("Error creating bulk seats", { error: err.message });
        return res.status(500).send({error: err.message, stack: err.stack})
    }
})


router.get("/seats/:screenId",async(req,res)=>{
    try{
    const result = await getSeatsByScreen(req.params.screenId)
    logger.info("Fetched seats by screen", { screenId: req.params.screenId, count: result.data.data.length });
    return res.status(result.status).send(result.data.data)
    }catch(err){
        logger.error("Error fetching seats by screen", { screenId: req.params.screenId, error: err.message });
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