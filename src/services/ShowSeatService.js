const ShowSeat = require("../models/ShowSeat");
const Seat = require("../models/Seat");
const Show = require("../models/Show");
const mongoose = require('mongoose')
/**
 * Create ShowSeat entries for all seats in a screen for a show
 */
exports.createShowSeatForShow = async (showId, screenId) => {
  const existing = await ShowSeat.find({ showId }).countDocuments();

  if (existing > 0) {
    return {
      status: 200,
      data: {
        message: "ShowSeats already exist — skipping creation",
      }
    };
  }

  const seats = await Seat.find({ screenId });

  const showSeats = seats.map(seat => ({
    showId,
    seatId: seat._id,
    seatNumber: seat.seatNumber,
    status: "AVAILABLE"
  }));

  const result = await ShowSeat.insertMany(showSeats);

  return {
    status: 200,
    data: {
      message: "ShowSeats created successfully",
      data: result
    }
  };
};



/**
 * Get all ShowSeats for a show
 */
exports.getShowSeatsByShow = async (showId) => {

  console.log("Fetching ShowSeats for showId:", showId);
  const result = await ShowSeat.find({ showId }).sort({ seatNumber: 1 });

  if (result.length === 0) throw new Error("No ShowSeats found for this show");

  return {
    status: 200,
    data: {
      message: "Fetched ShowSeats",
      data: result
    }
  };
};


/**
 * Block seats temporarily (during payment)
 */
// exports.blockSeats = async (seatIds) => {
//     console.log("The data received to the ShowSeat Service is",seatIds);
    
//   const result = await ShowSeat.updateMany(
//     { _id: { $in: seatIds }, status: "AVAILABLE" },
//     { $set: { status: "BLOCKED" } }
//   );

//   return {
//     status: 200,
//     data: { message: "Seats blocked successfully" }
//   };
// };


/**
 * Confirm Booking (BOOK seats)
 */

/**
 * Block seats temporarily (during payment)
 * Accepts: seatIds (array of showSeat _id strings) OR single id
 */
// services/ShowSeatService.js

exports.blockSeats = async (showSeatIds,showId) => {
  if (!Array.isArray(showSeatIds)) showSeatIds = [showSeatIds];

  const now = new Date();
  const expires = new Date(now.getTime() +  60 * 1000); 

  const validIds = showSeatIds.filter(id => mongoose.isValidObjectId(id));

  const result = await ShowSeat.updateMany(
    {
      _id: { $in: validIds },
      showId,
      status: "AVAILABLE"
    },
    {
      $set: {
        status: "BLOCKED",
        blockedAt: now,
        blockedUntil: expires
      }
    }
  );

  return {
    status: result.modifiedCount > 0 ? 200 : 409,
    data: {
      message: result.modifiedCount > 0
        ? "Seats blocked for 10 minutes"
        : "No seats were blocked — already blocked or booked",
      modifiedCount: result.modifiedCount,
      expiresAt: expires
    }
  };
};



exports.bookSeats = async (showSeatIds) => {
  const result = await ShowSeat.updateMany(
    { _id: { $in: showSeatIds }, status: { $in: ["AVAILABLE", "BLOCKED"] } },
    { $set: { status: "BOOKED" } }
  );

  return {
    status: 200,
    data: { message: "Seats booked successfully" }
  };
};



/**
 * Release seats (if payment fails)
 */
exports.releaseSeats = async (seatIds) => {
  await ShowSeat.updateMany(
    { _id: { $in: seatIds } },
    { $set: { status: "AVAILABLE" } }
  );

  return {
    status: 200,
    data: { message: "Seats released successfully" }
  };
};
