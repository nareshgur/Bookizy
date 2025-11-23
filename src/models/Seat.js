const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema(
  {
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },

    seatNumber: {
      type: String, // A1, A2, B5, etc.
      required: true,
    },

    row: {
      type: String,
      required: true,
    },

    col: {
      type: Number,
      required: true,
    },
    
    seatType: {
      type: String,
      enum: ["SILVER", "GOLD", "PLATINUM"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seat", SeatSchema);
