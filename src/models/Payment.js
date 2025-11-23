const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String
    },

    razorpaySignature: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    method: {
      type: String // card / upi / wallet / netbanking
    },

    status: {
      type: String,
      enum: ["CREATED", "PENDING", "SUCCESS", "FAILED"],
      default: "CREATED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
