import BASE_URL from "../config/api";

export const createRemainingPaymentIntent = async (bookingId, amount) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${BASE_URL}/api/payments/pay-remaining`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId, amount }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Payment initiation failed");
  }

  return {
    clientSecret: data.clientSecret,
    paymentIntentId: data.paymentIntentId,
  };
};
