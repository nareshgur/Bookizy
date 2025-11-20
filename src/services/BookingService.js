const Booking = require("../models/Booking");
const ShowSeat = require("../models/ShowSeat");
const mongoose = require("mongoose");

/**
 * Create booking BEFORE payment starts
 * Booking = PENDING
 */
exports.createPendingBooking = async (data) => {
    
    const { userId, showId, showSeatIds, totalAmount } = data;
    console.log("The data we received is to the Booking Service",data);

  // Check seats are still BLOCKED (NOT booked!)
  const seatCheck = await ShowSeat.find({
    _id: { $in: showSeatIds },
    status: "BLOCKED"
  });

  if (seatCheck.length !== showSeatIds.length) {
    throw new Error("Some seats are no longer available. Please select again.");
  }

  // Create booking in pending state
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
exports.confirmBookingAfterPayment = async (bookingId, paymentId) => {
    console.log("The data we received is ",bookingId,paymentId);
    
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const now = new Date();

  // Convert seats from BLOCKED → BOOKED
  await ShowSeat.updateMany(
    {
      _id: { $in: booking.showSeatIds },
      status: "BLOCKED",
      blockedUntil: { $gt: now }
    },
    {
      $set: {
        status: "BOOKED",
        blockedAt: null,
        blockedUntil: null
      }
    }
  );

  // Update booking status
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "CONFIRMED", paymentId },
    { new: true }
  );

  return {
    status: 200,
    data: { message: "Booking confirmed", data: updatedBooking }
  };
};


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
