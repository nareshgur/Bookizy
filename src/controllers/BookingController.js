const express = require("express");
const router = express.Router();

const {
  createPendingBooking,
  confirmBookingAfterPayment,
  cancelBooking
} = require("../services/BookingService");
const Booking = require("../models/Booking");

// Step 1 → Create pending booking before payment
router.post("/Booking/CreatePending", async (req, res) => {
  try {
    console.log("The data we received to the Booking controller",req.body);
    
    const result = await createPendingBooking(req.body);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Step 2 → After payment success, confirm booking
router.put("/Booking/Confirm/:bookingId", async (req, res) => {
  try {
    const result = await confirmBookingAfterPayment(
      req.params.bookingId,
      req.body.paymentId
    );
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Optional cancel
router.put("/Booking/Cancel/:bookingId", async (req, res) => {
  try {
    const result = await cancelBooking(req.params.bookingId);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});


router.get("/booking/:bookingId", async (req, res) => {
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

      console.log("Fetched booking details are :", booking);

    return res.json({ status: 200, data: booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});





// GET /api/bookings/user/:userId
router.get("/bookings/user/:userId",   async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate({
        path: "showId",
        populate: [
          { path: "movieId" },  // inside Show -> movieId
          { path: "theatreId" }, // inside Show -> theatreId
          { path: "screenId" }
        ]
      })
      .populate({
        path: "showSeatIds",
        populate: {
          path: "seatId",   // <- ensures seatNumber comes
        },
      })
      .populate("paymentId")
      .sort({ createdAt: -1 }); // Latest first

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
