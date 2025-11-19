const mongoose = require("mongoose");

const ShowSeatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "BLOCKED"],
      default: "AVAILABLE"
    },

    price: {
      type: Number,
      required: true
    },
    blockedAt:Date,
    blockedUntil:Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShowSeat", ShowSeatSchema);
