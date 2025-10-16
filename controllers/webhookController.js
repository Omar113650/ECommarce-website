import Stripe from "stripe";
import PaymentLog from "../models/Stripe.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig, // stripe signature
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // عند اكتمال الـ checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    await PaymentLog.findOneAndUpdate(
      { paymentReference: session.id },
      { status: "paid" }
    );

    console.log(" Payment confirmed:", session.id);
  }

  res.json({ received: true });
};
