// بوست مان

// import express from "express";
// import Stripe from "stripe";
// import dotenv from "dotenv";
// import PaymentLog from "../models/Stripe.js";
// import { Order } from "../models/Order.js";

// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// const router = express.Router();

// /**
//  * @desc   Stripe Webhook endpoint
//  * @route  POST /api/v1/payment/webhook
//  * @access Public
//  */
// router.post("/webhook", express.json(), async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   // let event;

//   const event = req.body;

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object;
//         console.log("✅ Checkout session completed:", session.id);

//         // 🧠 Prevent duplicates
//         const existingLog = await PaymentLog.findOne({
//           paymentReference: session.id,
//         });

//         if (existingLog) {
//           console.log("⚠️ PaymentLog already exists, skipping duplicate save.");
//         } else {
//           await PaymentLog.create({
//             orderId: session.metadata?.orderId,
//             paymentReference: session.id,
//             paymentIntentId: session.payment_intent,
//             amount: session.amount_total
//               ? session.amount_total / 100
//               : session.amount_subtotal
//               ? session.amount_subtotal / 100
//               : 0,
//             currency: session.currency || "usd",
//             status: "paid",
//             paymentMethod: "card",
//             customerEmail: session.customer_details?.email || "unknown",
//             rawResponse: session,
//             webhookVerified: true,
//           });
//         }

//         // ✅ Update order status if found
//         if (session.metadata?.orderId) {
//           await Order.findByIdAndUpdate(session.metadata.orderId, {
//             paymentStatus: "Paid",
//             status: "Processing",
//           });
//           console.log(
//             `🧾 Order ${session.metadata.orderId} updated to 'Paid'.`
//           );
//         } else {
//           console.log("⚠️ No orderId found in session metadata.");
//         }

//         break;
//       }

//       case "payment_intent.payment_failed": {
//         const paymentIntent = event.data.object;
//         console.log("❌ Payment failed:", paymentIntent.id);

//         await PaymentLog.findOneAndUpdate(
//           { paymentIntentId: paymentIntent.id },
//           {
//             status: "failed",
//             rawResponse: paymentIntent,
//             webhookVerified: true,
//           },
//           { upsert: true }
//         );

//         break;
//       }

//       default:
//         console.log(`⚠️ Unhandled event type: ${event.type}`);
//     }

//     // ✅ Respond to Stripe quickly
//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("💥 Error handling webhook:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// export default router;








// حقيقي 





// import express from "express";
// import Stripe from "stripe";
// import dotenv from "dotenv";
// import PaymentLog from "../models/Stripe.js";
// import { Order } from "../models/Order.js";

// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// const router = express.Router();

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body, // raw body
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//       console.log("✅ Webhook verified successfully!");
//     } catch (err) {
//       console.log("❌ Webhook signature failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       if (event.type === "checkout.session.completed") {
//         const session = event.data.object;

//         await PaymentLog.create({
//           orderId: session.metadata?.orderId,
//           paymentReference: session.id,
//           amount: session.amount_total / 100,
//           currency: session.currency,
//           status: "paid",
//           customerEmail: session.customer_details?.email,
//           rawResponse: session,
//         });

//         if (session.metadata?.orderId) {
//           await Order.findByIdAndUpdate(session.metadata.orderId, {
//             paymentStatus: "Paid",
//             status: "Processing",
//           });
//         }
//       }

//       res.json({ received: true });
//     } catch (err) {
//       console.error("💥 Error handling webhook:", err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

// export default router;











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
      );
      console.log("✅ Webhook verified successfully!");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Checkout session completed:", session.id);
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
