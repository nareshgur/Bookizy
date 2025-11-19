const express = require("express");
const router = express.Router();

const {
  createShowSeatForShow,
  getShowSeatsByShow,
  blockSeats,
  bookSeats,
  releaseSeats
} = require("../services/ShowSeatService");


/** Create ShowSeats for a show */
router.post("/ShowSeat/Create/:showId/:screenId", async (req, res) => {
  try {
    const { showId, screenId } = req.params;
    const result = await createShowSeatForShow(showId, screenId);
    return res.status(result.status).send(result.data);
  } catch (err) {
    console.log("Error creating ShowSeats", err);
    return res.status(500).send({ message: err.message });
  }
});


/** Get ShowSeats for Show */
router.get("/ShowSeat/:showId", async (req, res) => {
  try {
    const result = await getShowSeatsByShow(req.params.showId);
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error fetching ShowSeats", err);
    return res.status(500).send({ message: err.message });
  }
});


/** Block seats */
// Block seats
// controllers/ShowSeatController.js
router.put("/ShowSeat/Block", async (req, res) => {
  try {
    let { showSeatIds } = req.body;

    if (!showSeatIds) {
      return res.status(400).send({ message: "showSeatIds required" });
    }

    const result = await blockSeats(showSeatIds);
    return res.status(result.status).send(result.data);

  } catch (err) {
    console.error("Block Error:", err);
    return res.status(500).send({ message: err.message });
  }
});




/** Book seats */
router.put("/ShowSeat/Book", async (req, res) => {
  try {
    const { showSeatIds } = req.body;
    const result = await bookSeats(showSeatIds);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});


/** Release seats */
router.put("/ShowSeat/Release", async (req, res) => {
  try {
    const { showSeatIds } = req.body;
    const result = await releaseSeats(showSeatIds);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});


module.exports = router;
