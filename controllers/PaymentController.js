import Stripe from "stripe";
import PaymentLog from "../models/Stripe.js";
import { Order } from "../models/Order.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payment/checkout/:orderId
// @access  Private
export const createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: "Product" },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: order._id.toString(),
        userId: order.userId.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/api/v1/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/api/v1/payment/cancel`,
    });

    // سجل الدفع
    await PaymentLog.create({
      orderId: order._id,
      paymentReference: session.id,
      amount: order.totalAmount,
      currency: "usd",
      status: "unpaid",
      paymentMethod: "card",
      customerEmail: req.user?.Email || null,
      rawResponse: session,
    });

    return res.status(200).json({
      message: "💳 Stripe session created successfully",
      checkoutUrl: session.url,
      orderId: order._id,
    });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ message: "Stripe session failed", error: error.message });
  }
};
