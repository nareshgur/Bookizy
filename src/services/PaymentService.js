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
  // Step 1 — Verify signature
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

  // Step 3 — Update Payment record
  const payment = await Payment.findByIdAndUpdate(
    paymentDbId,
    {
      razorpayPaymentId,
      razorpaySignature,
      method: paymentInfo.method,
      status: payment.status
    },
    { new: true }
  );

  // Step 4 — Update Booking to CONFIRMED
  const booking = await Booking.findById(bookingId);

  await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "CONFIRMED",
      paymentId: payment._id
    },
    { new: true }
  );

  // Step 5 — Convert BLOCKED seats to BOOKED
  await ShowSeat.updateMany(
    {
      _id: { $in: booking.showSeatIds },
      status: "BLOCKED"
    },
    
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
      message: "Payment verified & booking confirmed!",
      payment,
      booking
    }
  };
};

