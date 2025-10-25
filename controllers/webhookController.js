import Stripe from "stripe";
import dotenv from "dotenv";
import PaymentLog from "../models/Stripe.js";
import { Order } from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // ✅ مهم جدًا: لازم تستخدم req.rawBody مش req.body
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Payment completed:", session.id);

      await PaymentLog.findOneAndUpdate(
        { paymentReference: session.id },
        { status: "paid", rawResponse: session }
      );

      if (session.metadata?.orderId) {
        await Order.findByIdAndUpdate(session.metadata.orderId, {
          paymentStatus: "Paid",
          status: "Processing",
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      console.log("❌ Payment failed:", event.data.object.id);
      break;
    }

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
