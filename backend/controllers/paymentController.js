// controllers/paymentController.js
const Booking = require("../models/Booking");

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⭐ Create Payment Intent for 10% Advance Payment
exports.createPaymentIntent = async (req, res) => {
    try {
        const { advancePaid,totalCost, vendorId } = req.body;

        if (!totalCost || !vendorId) {
            return res.status(400).json({
                success: false,
                message: "totalCost and vendorId are required"
            });
        }

        // Calculate 10% advance
        const advanceAmountpaise = Math.round(advancePaid  * 100); // Convert Rs → paise

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: advanceAmountpaise,
            currency: "inr",
            payment_method_types:["card"],
            metadata: {
                vendorId,
                purpose: "eventhub_advance_payment"
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            advanceAmount: advanceAmountpaise
        });

    } catch (error) {
        console.error("❌ Stripe Payment Intent Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create Stripe payment intent"
        });
    }
};


// ⭐ PAY REMAINING BALANCE (70% or actual remaining)
exports.payRemainingAmount = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, message: "BookingId and amount required" });
    }

    const amountPaise = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency: "inr",
      payment_method_types:["card"],

      metadata: {
        purpose: "eventhub_remaining_payment",
        bookingId
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error("❌ Remaining Payment Error:", err);
    res.status(500).json({ success: false, message: "Remaining payment failed" });
  }
};

exports.saveAdvancePayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: "bookingId and paymentIntentId required" });
    }

    // Get PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // ⭐ FIX: Fetch charge manually
    const charge = paymentIntent.latest_charge
      ? await stripe.charges.retrieve(paymentIntent.latest_charge)
      : null;

      console.log("paymenttrans: ",paymentIntent.latest_charge);
      console.log("Booking id : ",bookingId);

    await Booking.findByIdAndUpdate(bookingId, {
      paymentIntentId: paymentIntent.id,
      stripeTransactionId: paymentIntent.latest_charge|| null,
      stripeReceiptUrl: charge?.receipt_url || null,
    });

    res.json({ success: true, message: "Advance payment saved!" });

  } catch (error) {
    console.error("❌ Error saving advance payment:", error);
    res.status(500).json({ success: false, message: "Failed to save advance payment" });
  }
};


exports.saveFinalPayment = async (req, res) => {
  console.log("📥 BACKEND RECEIVED PAYMENT DATA >>>", req.body);

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: "bookingId and paymentIntentId required" });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // ⭐ FIX: Fetch charge manually
    const charge = paymentIntent.latest_charge
      ? await stripe.charges.retrieve(paymentIntent.latest_charge)
      : null;

    await Booking.findByIdAndUpdate(bookingId, {
      finalPaymentIntentId: paymentIntent.id,
      finalTransactionId: paymentIntent.latest_charge || null,
      finalReceiptUrl: charge?.receipt_url || null,
      paymentStatus: "paid_full",
      remainingBalance: 0,
      bookingStatus: "completed"
    });

    res.json({ success: true, message: "Final payment saved!" });

  } catch (error) {
    console.error("❌ Error saving final payment:", error);
    res.status(500).json({ success: false, message: "Failed to save final payment" });
  }
};
