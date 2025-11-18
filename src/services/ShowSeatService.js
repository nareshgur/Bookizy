const ShowSeat = require("../models/ShowSeat");
const Seat = require("../models/Seat");
const Show = require("../models/Show");
const mongoose = require('mongoose')
/**
 * Create ShowSeat entries for all seats in a screen for a show
 */
exports.createShowSeatForShow = async (showId, screenId) => {
  const show = await Show.findById(showId);
  const seats = await Seat.find({ screenId });

  if (!show) throw new Error("Show not found");
  if (seats.length === 0) throw new Error("No seats found for this screen");

  const showSeats = seats.map((seat) => ({
    showId,
    seatId: seat._id,
    seatNumber: seat.seatNumber,
    status: "AVAILABLE",
    price: show.price
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
exports.blockSeats = async (seatIds, opts = {}) => {
  // normalize


  console.log("The data we received at the Show Service layer",seatIds,opts);
  
  if (!seatIds) throw new Error("seatIds required");
  if (!Array.isArray(seatIds)) seatIds = [seatIds];

  // filter out invalid/empty values
  seatIds = seatIds.filter(Boolean);
  if (seatIds.length === 0) throw new Error("seatIds must be a non-empty array");

  // convert to ObjectId safely
  const objIds = seatIds.map(id => {
    if (mongoose.isValidObjectId(id)) return new mongoose.Types.ObjectId(id);
    console.log("Invalid ObjectId:", id);
    return null;
  }).filter(Boolean);

  console.log("The objIds after converting them into the ObjectId",objIds);
  

  if (objIds.length === 0) throw new Error("No valid ObjectId values found in seatIds");

  // optional: allow passing showId to ensure we only update seats for that show
  const { showId } = opts;
  const query = { _id: { $in: objIds }, status: "AVAILABLE" };
  if (showId) {
    if (mongoose.isValidObjectId(showId)) query.showId = new mongoose.Types.ObjectId(showId);
  }

  const update = { $set: { status: "BLOCKED" } };

  const result = await ShowSeat.updateMany(query, update);

  console.log("The result we got after converting blocking seats",result);
  

  // robust result handling across mongoose versions
  const modified = result.modifiedCount ?? result.nModified ?? 0;

  return {
    status: modified > 0 ? 200 : 409,
    data: {
      message: modified > 0 ? "Seats blocked successfully" : "No seats were blocked — they may already be blocked/booked or ids are invalid.",
      modifiedCount: modified,
      matchedCount: result.matchedCount ?? result.n ?? 0
    }
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
