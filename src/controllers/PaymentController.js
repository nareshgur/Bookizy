const express = require("express");
const {
  createRazorpayOrder,
  verifyPaymentAndConfirmBooking
} = require("../services/PaymentService");

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

module.exports = router;
