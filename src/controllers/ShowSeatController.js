const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const {
  createShowSeatForShow,
  getShowSeatsByShow,
  blockSeats,
  bookSeats,
  releaseSeats
} = require("../services/ShowSeatService");
const auth = require("../middleware/AuthMiddleware");

/** Create ShowSeats for a show */
router.post("/ShowSeat/Create/:showId/:screenId", auth , async (req, res) => {
  try {
    const { showId, screenId } = req.params;
    const result = await createShowSeatForShow(showId, screenId);
    logger.info("ShowSeats created for show", { showId, screenId, count: result.data.data?.length || 0 });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error creating ShowSeats", { showId: req.params.showId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


/** Get ShowSeats for Show */
router.get("/ShowSeat/:showId", auth , async (req, res) => {
  try {
    logger.info("Fetching ShowSeats for show", { showId: req.params.showId });
    const result = await getShowSeatsByShow(req.params.showId);
    logger.info("ShowSeats fetched successfully", { showId: req.params.showId, count: result.data.data?.length || 0 });
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    logger.error("Error fetching ShowSeats", { showId: req.params.showId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


/** Block seats */
// Block seats
// controllers/ShowSeatController.js
router.put("/ShowSeat/Block", auth , async (req, res) => {
  try {
    let { showSeatIds,showId } = req.body;
    logger.info("Block seats request received", { showId, count: showSeatIds?.length || 0 });

    if (!showSeatIds) {
      return res.status(400).send({ message: "showSeatIds required" });
    }

    const result = await blockSeats(showSeatIds,showId);
    logger.info("Seats blocked successfully", { showId, count: showSeatIds.length });
    return res.status(result.status).send(result.data);

  } catch (err) {
    logger.error("Error blocking seats", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});




/** Book seats */
router.put("/ShowSeat/Book", auth , async (req, res) => {
  try {
    const { showSeatIds } = req.body;
    logger.info("Book seats request received", { count: showSeatIds?.length || 0 });
    const result = await bookSeats(showSeatIds);
    logger.info("Seats booked successfully", { count: showSeatIds?.length || 0 });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error booking seats", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


/** Release seats */
router.put("/ShowSeat/Release", auth , async (req, res) => {
  try {
    const { showSeatIds } = req.body;
    logger.info("Release seats request received", { count: showSeatIds?.length || 0 });
    const result = await releaseSeats(showSeatIds);
    logger.info("Seats released successfully", { count: showSeatIds?.length || 0 });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error releasing seats", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


module.exports = router;
