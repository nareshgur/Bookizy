const express = require("express");
const router = express.Router();

const {
  createPendingBooking,
  confirmBookingAfterPayment,
  cancelBooking
} = require("../services/BookingService");

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

module.exports = router;
