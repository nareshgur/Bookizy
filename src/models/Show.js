const mongoose = require("mongoose");

const ShowSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number, // TMDB movie ID
      required: true
    },

    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true
    },

    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: String, // "2025-10-14"
      required: true
    },

    startTime: {
      type: String, // "19:00", "22:30"
      required: true
    },

    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", ShowSchema);
