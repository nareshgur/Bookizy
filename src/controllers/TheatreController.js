const express = require('express')
const { createTheatre } = require('../services/TheatreService')
const { Theatre } = require('../models/Theatre')
const mongoose = require('mongoose')
const Screen = require('../models/Screen')
const Show = require('../models/Show')



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



router.get("/Theatres/city/:cityId",async (req,res)=>{
    try{
        const theatres = await Theatre.find({cityId:req.params.cityId})

        if(!theatres) return res.status(404).send("No theatres are found for the given City")
        
        return res.status(200).send(theatres)
    }catch(err){
        console.log("SOmething went wrong while fetching the theatres at theatre controller ", err);
            return res.status(500).send({message:"Internal Server Error",error:err})
    }
})


router.get("/Theatres/id/:theatreId",async (req,res)=>{
    try{
        const theatres = await Theatre.findById(req.params.theatreId)
        console.log("Theatres found are : ", theatres);
        if(theatres?.length===0) return res.status(404).send("No theatres are found for the given City")
        
        return res.status(200).send(theatres)
    }catch(err){
        console.log("SOmething went wrong while fetching the theatres at theatre controller ", err);
            return res.status(500).send({message:"Internal Server Error",error:err})
    }
})

router.get("/Theatres/Search/:TheatreName", async (req,res)=>{
    try{
        const result = await Theatre.find({name:req.params.TheatreName})
        
        if(!result) return res.status(404).send("No Theatres found ")

        return res.status(200).send(result)
        
    }catch(err){
        console.log("Something went wrong while fetching the Theatres ",err);
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

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ status: 404, message: "Theatre not found" });

    // screens (if you have a separate Screen collection)
    const screens = await Screen.find({ theatreId: theatreId }).sort({ name: 1 });

    // find shows in this theatre (populate movie and screen info)
    const shows = await Show.find({ theatreId })
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

    res.json({ status: 200, data: { theatre, screens, showsByScreen } });
  } catch (err) {
    console.error("Theatre details error:", err);
    res.status(500).json({ status: 500, message: "Server error" });
  }
});


module.exports = router