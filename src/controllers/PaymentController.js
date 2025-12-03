const express = require("express");
const {
  createRazorpayOrder,
  verifyPaymentAndConfirmBooking,
  cancelPaymentAndReleaseSeats
} = require("../services/PaymentService");
const auth = require("../middleware/AuthMiddleware");

const router = express.Router();

// Step 1 — Create Order
router.post("/Payment/CreateOrder", async (req, res) => {
  try {
    const result = await createRazorpayOrder(req.body);
    return res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Step 2 — Verify & Confirm Booking
router.post("/Payment/Verify", async (req, res) => {
  try {
    const result = await verifyPaymentAndConfirmBooking(req.body);
    return res.status(result.status).send(result.data);
  } catch (err) {
    console.log("Payment verify failed", err);
    return res.status(500).send({ message: err.message });
  }
});


router.post("/cancel", async (req, res) => {
  try {
    // expecting { bookingId, paymentDbId }
    const result = await cancelPaymentAndReleaseSeats(req.body);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error("cancel payment error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
