  const crypto = require("crypto");
  const Booking = require("../models/Booking");
  const ShowSeat = require("../models/ShowSeat");
  const Payment = require("../models/Payment");
  const razorpay = require("../config/razorpay");

  exports.createRazorpayOrder = async ({ bookingId }) => {


    const booking = await Booking.findById(bookingId)

    const options = {
      amount: booking.totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      payment_capture: 1
    };

    // Create Razorpay Order
    const order = await razorpay.orders.create(options);

    console.log("The order that is created ",order.id);
    
    // Save in DB
    const payment = await Payment.create({
      bookingId,
      razorpayOrderId: order.id,
      amount:booking.totalAmount,
      status: "PENDING",
      key: order.key
    });

    return {
      status: 200,
      data: {
        message: "Razorpay order created",
        order: order,
        paymentId: payment._id,
        orderId:order.id
      }
    };
  };



exports.verifyPaymentAndConfirmBooking = async ({
  bookingId,
  paymentDbId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {

  // Step 1 — Verify Razorpay Signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Invalid Payment Signature");
  }

  // Step 2 — Fetch payment details from Razorpay
  const paymentInfo = await razorpay.payments.fetch(razorpayPaymentId);

  // Step 3 — Fetch booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Step 4 — Re-check seat status BEFORE confirming booking
  const seatIds = booking.showSeatIds;

  const seats = await ShowSeat.find({ _id: { $in: seatIds } });

  const anySeatInvalid = seats.some(
    seat => seat.status !== "BLOCKED"
  );

  if (anySeatInvalid) {
    // ❌ Payment succeeded but seats are gone
    await Payment.findByIdAndUpdate(paymentDbId, {
      status: "REFUND_REQUIRED", 
      razorpayPaymentId,
      razorpaySignature,
      method: paymentInfo.method
    });

    await Booking.findByIdAndUpdate(bookingId, {
      status: "FAILED"
    });

    throw new Error(
      "Payment received but seats are no longer available. Refund will be processed."
    );
  }

  // Step 5 — Update Payment record
  const payment = await Payment.findByIdAndUpdate(
    paymentDbId,
    {
      razorpayPaymentId,
      razorpaySignature,
      method: paymentInfo.method,
      status: "CAPTURED"
    },
    { new: true }
  );

  // Step 6 — Confirm booking
  await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "CONFIRMED",
      paymentId: payment._id
    }
  );

  // Step 7 — Convert BLOCKED → BOOKED
  await ShowSeat.updateMany(
    { _id: { $in: seatIds } },
    {
      $set: {
        status: "BOOKED",
        blockedUntil: null,
        blockedAt: null
      }
    }
  );

  return {
    status: 200,
    data: {
      message: "Payment verified & booking confirmed",
      booking,
      payment
    }
  };
};


  exports.cancelPaymentAndReleaseSeats = async ({ bookingId, paymentDbId }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  // Mark payment as FAILED
  if (paymentDbId) {
    await Payment.findByIdAndUpdate(paymentDbId, {
      status: "FAILED",
    });
  }

  // Mark booking as CANCELLED
  await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "CANCELLED",
    },
    { new: true }
  );

  // Release blocked seats immediately
  await ShowSeat.updateMany(
    {
      _id: { $in: booking.showSeatIds },
      status: "BLOCKED",
    },
    {
      $set: {
        status: "AVAILABLE",
        blockedAt: null,
        blockedUntil: null,
      },
    }
  );

  return {
    status: 200,
    data: {
      message: "Cancelled booking and released seats",
    },
  };
};

