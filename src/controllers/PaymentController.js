const express = require("express");
const logger = require("../utils/logger");
const {
  createRazorpayOrder,
  verifyPaymentAndConfirmBooking,
  cancelPaymentAndReleaseSeats
} = require("../services/PaymentService");
const auth = require("../middleware/AuthMiddleware");

const router = express.Router();

// Step 1 — Create Order
router.post("/Payment/CreateOrder", auth, async (req, res) => {
  try {
    logger.info("Payment order creation request", { amount: req.body.amount });
    const result = await createRazorpayOrder(req.body);
    logger.info("Payment order created", { orderId: result.data?.data?.id });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error creating payment order", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

// Step 2 — Verify & Confirm Booking
router.post("/Payment/Verify", auth, async (req, res) => {
  try {
    logger.info("Payment verification request", { orderId: req.body.orderId });
    const result = await verifyPaymentAndConfirmBooking(req.body);
    logger.info("Payment verified and booking confirmed", { bookingId: result.data?.data?.bookingId });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Payment verification failed", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


router.post("/cancel", auth, async (req, res) => {
  try {
    logger.info("Payment cancellation request", { bookingId: req.body.bookingId });
    const result = await cancelPaymentAndReleaseSeats(req.body);
    logger.info("Payment cancelled and seats released", { bookingId: req.body.bookingId });
    return res.status(result.status).json(result.data);
  } catch (err) {
    logger.error("Error cancelling payment", { error: err.message });
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
