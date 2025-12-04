const express = require("express");
const router = express.Router();
const auth = require("../middleware/AuthMiddleware");
const logger = require("../utils/logger");
const {
  createPendingBooking,
  confirmBookingAfterPayment,
  cancelBooking
} = require("../services/BookingService");
const Booking = require("../models/Booking");

// Step 1 → Create pending booking before payment
router.post("/Booking/CreatePending", auth, async (req, res) => {
  try {
    logger.info("Pending booking creation request received", { userId: req.body.userId, showId: req.body.showId });
    console.log("Pending booking creation request received", { userId: req.body.userId, showId: req.body.showId });
    const result = await createPendingBooking(req.body);
    logger.info("Pending booking created", { bookingId: result.data?.data?._id });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error creating pending booking", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

// Step 2 → After payment success, confirm booking
router.put("/Booking/Confirm/:bookingId", auth, async (req, res) => {
  try {
    logger.info("Booking confirmation request", { bookingId: req.params.bookingId, paymentId: req.body.paymentId });
    const result = await confirmBookingAfterPayment(
      req.params.bookingId,
      req.body.paymentId
    );
    logger.info("Booking confirmed successfully", { bookingId: req.params.bookingId });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error confirming booking", { bookingId: req.params.bookingId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

// Optional cancel
router.put("/Booking/Cancel/:bookingId", auth, async (req, res) => {
  try {
    logger.info("Booking cancellation request", { bookingId: req.params.bookingId });
    const result = await cancelBooking(req.params.bookingId);
    logger.info("Booking cancelled successfully", { bookingId: req.params.bookingId });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error cancelling booking", { bookingId: req.params.bookingId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


router.get("/booking/:bookingId", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: "showId",
        populate: [
          { path: "movieId" },
          { path: "theatreId" },
          { path: "screenId" }
        ]
      })
      .populate({
        path: "showSeatIds",
        populate: { path: "seatId" }
      })
      .populate("paymentId");

    logger.info("Booking details retrieved", { bookingId: req.params.bookingId });
    return res.json({ status: 200, data: booking });
  } catch (err) {
    logger.error("Error fetching booking details", { bookingId: req.params.bookingId, error: err.message });
    return res.status(500).json({ message: err.message });
  }
});





// GET /api/bookings/user/:userId
router.get("/bookings/user/:userId",   auth, async (req, res) => {
  try {
    const { userId } = req.params;
    logger.info("Fetching user bookings", { userId });

    const bookings = await Booking.find({ userId })
      .populate({
        path: "showId",
        populate: [
          { path: "movieId" },
          { path: "theatreId" },
          { path: "screenId" }
        ]
      })
      .populate({
        path: "showSeatIds",
        populate: {
          path: "seatId",
        },
      })
      .populate("paymentId")
      .sort({ createdAt: -1 });

    logger.info("User bookings retrieved", { userId, count: bookings?.length || 0 });
    return res.json({
      status: 200,
      data: bookings,
    });

  } catch (err) {
    console.error("Error in getUserBookings:", err);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});




module.exports = router;
