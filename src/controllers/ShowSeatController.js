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
router.put("/ShowSeat/Block", async (req, res) => {
  try {
      
      // accept either { "seatIds": ["id1", "id2"] } or { "seatId": "id" } (single)
      console.log("The data we received at the Show Seat controller is ",req.body);
      
      let { seatIds, seatId, showId } = req.body;
      console.log("The data we received at the Show Seat controller ",seatIds,seatId,showId);

    if (!seatIds && seatId) seatIds = [seatId];

    // defensive validation
    if (!seatIds || (Array.isArray(seatIds) && seatIds.length === 0)) {
      return res.status(400).send({ message: "seatIds (non-empty array) or seatId (single) required" });
    }

    // call service with optional showId (recommended)
    const result = await blockSeats(seatIds, { showId });

    return res.status(result.status).send(result.data);
  } catch (err) {
    console.error("Error in /ShowSeat/Block:", err);
    return res.status(500).send({ message: err.message });
  }
});



/** Book seats */
router.put("/ShowSeat/Book", async (req, res) => {
  try {
    const { seatIds } = req.body;
    const result = await bookSeats(seatIds);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});


/** Release seats */
router.put("/ShowSeat/Release", async (req, res) => {
  try {
    const { seatIds } = req.body;
    const result = await releaseSeats(seatIds);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});


module.exports = router;
