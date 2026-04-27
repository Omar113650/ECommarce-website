import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import PaymentLog from "../models/Stripe.js";
import { Order } from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    console.log("Received Webhook Headers:", req.headers);

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log(" Webhook verified successfully!");
    } catch (err) {
      console.error(" Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(" Checkout session completed:", session.id);
      await PaymentLog.create({
        paymentReference: session.id,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: "paid",
        customerEmail: session.customer_details?.email,
      });
    }

    res.status(200).json({ received: true });
  }
);

export default router;
