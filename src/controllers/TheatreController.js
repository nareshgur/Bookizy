const express = require('express')
const { createTheatre } = require('../services/TheatreService')
const { Theatre } = require('../models/Theatre')
const mongoose = require('mongoose')
const Screen = require('../models/Screen')
const Show = require('../models/Show')
const logger = require('../utils/logger')


const router = express.Router()


router.post("/Theatre",async (req,res)=>{
    try{
        const result = await createTheatre(req.body)
        logger.info("Theatre created successfully", { theatreName: req.body.name });
        return res.status(result.status).send(result.data.data)
    }catch(err){
        logger.error("Error creating theatre", { error: err.message });
        return res.status(500).send("Internal server error",err)
        
    }
})



router.get("/Theatres/city/:cityId",async (req,res)=>{
    try{
        const theatres = await Theatre.find({cityId:req.params.cityId})
        logger.info("Fetched theatres by city", { cityId: req.params.cityId, count: theatres?.length || 0 });

        if(!theatres) return res.status(404).send("No theatres are found for the given City")
        
        return res.status(200).send(theatres)
    }catch(err){
        logger.error("Error fetching theatres by city", { cityId: req.params.cityId, error: err.message });
            return res.status(500).send({message:"Internal Server Error",error:err})
    }
})


router.get("/Theatres/id/:theatreId",async (req,res)=>{
    try{
        const theatres = await Theatre.findById(req.params.theatreId)
        logger.info("Fetched theatre by ID", { theatreId: req.params.theatreId });
        if(theatres?.length===0) return res.status(404).send("No theatres are found for the given City")
        
        return res.status(200).send(theatres)
    }catch(err){
        logger.error("Error fetching theatre by ID", { theatreId: req.params.theatreId, error: err.message });
            return res.status(500).send({message:"Internal Server Error",error:err})
    }
})

router.get("/Theatres/Search/:TheatreName", async (req,res)=>{
    try{
        const result = await Theatre.find({name:req.params.TheatreName})
        logger.info("Searched theatres by name", { name: req.params.TheatreName, count: result?.length || 0 });
        
        if(!result) return res.status(404).send("No Theatres found ")

        return res.status(200).send(result)
        
    }catch(err){
        logger.error("Error searching theatres", { name: req.params.TheatreName, error: err.message });
        return res.status(500).send(err)
        
    }
})


router.get("/search", async (req, res) => {

    console.log("Theatre search request received with query:", req.query);
  try {
    const { cityId, query = "" } = req.query;
    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ status: 400, message: "cityId is required and must be valid" });
    }

    console.log("The city and query received are :", cityId, query);

    console.log("The cityId received for theatre search is :", cityId);

    const theatres = await Theatre.find({
      cityId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
      ],
    }).sort({ name: 1 });

    return res.json({ status: 200, data: theatres });
  } catch (err) {
    console.error("Theatre search error:", err);
    res.status(500).json({ status: 500, message: "Server error" });
  }
});

/**
 * GET /api/Theatre/:theatreId/details
 * Returns theatre with its screens and upcoming shows populated (movie details).
 * Structure returned:
 * { theatre, screens: [{...}], showsByScreen: { screenId: [show,...] } }
 */
router.get("/:theatreId/details", async (req, res) => {
  try {
    const { theatreId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(theatreId)) {
      return res.status(400).json({ status: 400, message: "Invalid theatreId" });
    }

    // Get today's date in YYYY-MM-DD format for filtering
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // screens (if you have a separate Screen collection)
    const screens = await Screen.find({ theatreId: theatreId }).sort({ name: 1 });

    // find shows in this theatre (only future/today's shows) and populate movie and screen info
    const shows = await Show.find({ 
      theatreId,
      date: { $gte: todayString } // Only future/today's shows
    })
      .populate("movieId")
      .populate("screenId")
      .sort({ date: 1, startTime: 1 });

    // group shows by screenId
    const showsByScreen = {};
    shows.forEach((s) => {
      const sid = s.screenId ? s.screenId._id.toString() : "unknown";
      if (!showsByScreen[sid]) showsByScreen[sid] = [];
      showsByScreen[sid].push(s);
    });

    logger.info("Theatre details retrieved", { theatreId, screenCount: screens.length, showCount: shows.length });
    res.json({ status: 200, data: { theatre, screens, showsByScreen } });
  } catch (err) {
    logger.error("Error fetching theatre details", { theatreId: req.params.theatreId, error: err.message });
    res.status(500).json({ status: 500, message: "Server error" });
  }
});


module.exports = router