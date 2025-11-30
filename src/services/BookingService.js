const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const ShowSeat = require("../models/ShowSeat");
const mongoose = require("mongoose");

/**
 * Create booking BEFORE payment starts
 * Booking = PENDING
 */
exports.createPendingBooking = async (data) => {
  const { userId, showId, showSeatIds } = data;

  const showSeats = await ShowSeat.find({
    _id: { $in: showSeatIds },
    status: "BLOCKED"
  });

  if (showSeats.length !== showSeatIds.length) {
    throw new Error("Some seats are no longer available. Please select again.");
  }

  // collect seatIds once
  const seatIds = showSeats.map(s => s.seatId);
  const seats = await Seat.find({ _id: { $in: seatIds } }).select("price") ?? 250;

  const seatPriceById = new Map(
    seats.map(s => [s._id.toString(), s.price])
  );

  let totalAmount = 0;
  for (const showSeat of showSeats) {
    const price = seatPriceById.get(showSeat.seatId.toString());
    if (price == null) {
      throw new Error("Seat price not found for one of the seats.");
    }
    totalAmount += price;
  }

  const booking = await Booking.create({
    userId,
    showId,
    showSeatIds,
    totalAmount,
    status: "PENDING"
  });

  return {
    status: 200,
    data: { message: "Booking created (PENDING)", data: booking }
  };
};



/**
 * After payment verification
 * Confirm booking + lock seats permanently
 */
// exports.confirmBookingAfterPayment = async (bookingId, paymentId) => {
//     console.log("The data we received is ",bookingId,paymentId);
    
//   const booking = await Booking.findById(bookingId);
//   if (!booking) throw new Error("Booking not found");

//   const now = new Date();

//   // Convert seats from BLOCKED → BOOKED
//   await ShowSeat.updateMany(
//     {
//       _id: { $in: booking.showSeatIds },
//       status: "BLOCKED",
//       blockedUntil: { $gt: now }
//     },
//     {
//       $set: {
//         status: "BOOKED",
//         blockedAt: null,
//         blockedUntil: null
//       }
//     }
//   );

//   // Update booking status
//   const updatedBooking = await Booking.findByIdAndUpdate(
//     bookingId,
//     { status: "CONFIRMED", paymentId },
//     { new: true }
//   );

//   return {
//     status: 200,
//     data: { message: "Booking confirmed", data: updatedBooking }
//   };
// };


exports.cancelBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  await ShowSeat.updateMany(
    { _id: { $in: booking.showSeatIds } },
    { $set: { status: "AVAILABLE" } }
  );

  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "CANCELLED" },
    { new: true }
  );

  return { status: 200, data: { message: "Booking cancelled", data: updated } };
};


