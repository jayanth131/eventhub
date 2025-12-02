import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";

const StripePaymentComponent = ({ amount, bookingPayload, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleStripePayment = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    toast.loading("Processing secure payment…");

    try {
      // 1️⃣ Call backend to create payment intent
      const res = await fetch("http://localhost:5000/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          totalCost: amount,
          vendorId: bookingPayload.vendorId,
          advancePaid:bookingPayload.advancePaid,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Unable to initiate payment");

      const clientSecret = data.clientSecret;

      // 2️⃣ Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.dismiss();
        toast.error(result.error.message);
        setProcessing(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
  toast.dismiss();
  toast.success("Advance payment successful!");

  // ⭐ Save advance payment to backend
  await fetch("http://localhost:5000/api/payments/save-advance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({
      bookingId: bookingPayload.vendorId,
      paymentIntentId: result.paymentIntent.id,
    }),
  });

  // trigger booking creation
  onSuccess();
}

    } catch (err) {
      toast.dismiss();
      toast.error("Payment failed: " + err.message);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-4">
      <CardElement className="p-3 border rounded-md" />

      <button
        onClick={handleStripePayment}
        disabled={processing}
        className="w-full py-3 bg-[var(--royal-maroon)] text-white rounded-lg"
      >
        {processing ? "Processing…" : `Pay Advance ₹${amount * 0.3}`}
      </button>
    </div>
  );
};

export default StripePaymentComponent;
