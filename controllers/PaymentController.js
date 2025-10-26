// import Stripe from "stripe";
// import PaymentLog from "../models/Stripe.js";
// import { Order } from "../models/Order.js";
// import dotenv from "dotenv";
// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// // @desc    Create Stripe Checkout Session
// // @route   POST /api/v1/payment/checkout/:orderId
// // @access  Private
// export const createStripeSession = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     const lineItems = order.items.map((item) => ({
//       price_data: {
//         currency: "usd",
//         product_data: { name: "Product" },
//         unit_amount: Math.round(item.price * 100),
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       mode: "payment",
//       metadata: {
//         orderId: order._id.toString(),
//         userId: order.userId.toString(),
//       },
//       success_url: `${process.env.CLIENT_URL}/api/v1/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/api/v1/payment/cancel`,
//     });

//     // سجل الدفع
//     await PaymentLog.create({
//       orderId: order._id,
//       paymentReference: session.id,
//       amount: order.totalAmount,
//       currency: "usd",
//       status: "unpaid",
//       paymentMethod: "card",
//       customerEmail: req.user?.Email || null,
//       rawResponse: session,
//     });

//     return res.status(200).json({
//       message: "Stripe session created successfully",
//       checkoutUrl: session.url,
//       orderId: order._id,
//     });
//   } catch (error) {
//     console.error("tripe session error:", error);
//     res.status(500).json({ message: "Stripe session failed", error: error.message });
//   }
// };







import Stripe from "stripe";
import PaymentLog from "../models/Stripe.js";
import { Order } from "../models/Order.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    // جلب الأوردر
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // التأكد من وجود عناصر
    if (!order.items || order.items.length === 0) {
      return res.status(400).json({ message: "No items found in this order" });
    }

    // بناء line items للـ Stripe
    const lineItems = order.items
      .filter((item) => item.Price && item.quantity)
      .map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.Name || "Product",
          },
          unit_amount: Math.round(Number(item.Price) * 100), // تحويل للدولار سنت
        },
        quantity: Number(item.quantity) || 1,
      }));

    if (lineItems.length === 0) {
      return res.status(400).json({ message: "Invalid order items format" });
    }

    // حساب المبلغ الكلي بالـ سنت
    const totalAmount = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );
    console.log("Total amount to send to Stripe:", totalAmount);

    // إنشاء جلسة Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: order._id.toString(),
        userId: userId?.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    // حفظ اللوج
    await PaymentLog.create({
      orderId: order._id,
      paymentReference: session.id,
      amount: totalAmount / 100, // بالدولار
      currency: "usd",
      status: "pending",
      paymentMethod: "card",
      customerEmail: req.user?.email || order.customerEmail || null,
      rawResponse: session,
    });

    return res.status(200).json({
      message: "Stripe session created successfully",
      checkoutUrl: session.url,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({
      message: "Stripe session failed",
      error: error.message,
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id)
      return res.status(400).json({ message: "Missing session_id" });

    const payment = await PaymentLog.findOne({ paymentReference: session_id });
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    return res.status(200).json({ status: payment.status });
  } catch (error) {
    res.status(500).json({
      message: "Error checking payment status",
      error: error.message,
    });
  }
};
