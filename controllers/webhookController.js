import Stripe from "stripe";
import dotenv from "dotenv";
import PaymentLog from "../models/Stripe.js";
import { Order } from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Handle Stripe webhook events
// @route   POST /api/v1/payment/webhook
// @access  Public
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Webhook verified successfully!");
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        });

        if (!order) {
          console.warn(" No matching order found for this PaymentIntent.");
        } else {
          order.status = "paid";
          order.paymentStatus = "success";
          await order.save();
          console.log(`Order ${order._id} marked as paid.`);
        }

        await PaymentLog.create({
          orderId: order?._id,
          paymentReference: paymentIntent.id,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency || "usd",
          status: "paid",
          paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
          customerEmail: paymentIntent.receipt_email || "unknown",
          rawResponse: paymentIntent,
          webhookVerified: true,
        });

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(` Checkout session completed: ${session.id}`);

        const order = await Order.findOne({
          paymentReference: session.id,
        });

        if (order) {
          order.status = "paid";
          order.paymentStatus = "success";
          await order.save();
          console.log(` Order ${order._id} marked as paid.`);
        } else {
          console.warn(" No matching order found for this session.");
        }

        await PaymentLog.create({
          orderId: order?._id,
          paymentReference: session.id,
          paymentIntentId: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency || "usd",
          status: "paid",
          paymentMethod: "card",
          customerEmail: session.customer_details?.email || "unknown",
          rawResponse: session,
          webhookVerified: true,
        });

        break;
      }

      default:
        console.log(`ℹ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
