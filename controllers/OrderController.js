import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";

// @desc    Create Order Automatically from Cart
// @route   POST /api/v1/order
// @access  Private (User)
// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
//     const userCart = await Cart.findOne({ userId }).populate("items.productId");
//     if (!userCart || userCart.items.length === 0) {
//       return res.status(400).json({ message: "Your cart is empty" });
//     }

//     const totalAmount = userCart.items.reduce((acc, item) => {
//       const price = item.productId.price || 0;
//       return acc + price * item.quantity;
//     }, 0);

//     const newOrder = await Order.create({
//       userId,
//       items: userCart.items.map((i) => ({
//         productId: i.productId._id,
//         quantity: i.quantity,
//         price: i.productId.price,
//       })),
//       totalAmount,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Cash" ? "Paid" : "Pending",
//       status: paymentMethod === "Cash" ? "Processing" : "Pending",
//     });

//     await Cart.findOneAndDelete({ userId });

//     if (paymentMethod === "Cash") {
//       return res.status(201).json({
//         message: "Order placed successfully (Cash Payment)",
//         order: newOrder,
//       });
//     }
//     res.status(200).json({
//       message: "Proceed to Stripe payment",
//       orderId: newOrder._id,
//       totalAmount,
//       quantity,
//       price,
//     });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };


// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const userCart = await Cart.findOne({ userId }).populate("items.productId");
//     if (!userCart || userCart.items.length === 0) {
//       return res.status(400).json({ message: "Your cart is empty" });
//     }

//     const totalAmount = userCart.items.reduce((acc, item) => {
//       const price = item.productId?.Price || 0;
//       return acc + price * item.quantity;
//     }, 0);

//     const newOrder = await Order.create({
//       userId,
//       items: userCart.items.map((i) => ({
//         productId: i.productId._id,
//         Name: i.productId.Name, // ✅ أضف الاسم هنا
//         Price: i.productId.Price, // ✅ أضف السعر هنا
//         quantity: i.quantity,
//       })),
//       totalAmount,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Cash" ? "Paid" : "Pending",
//       status: paymentMethod === "Cash" ? "Processing" : "Pending",
//     });

//     await Cart.findOneAndDelete({ userId });

//     if (paymentMethod === "Cash") {
//       return res.status(201).json({
//         message: "Order placed successfully (Cash Payment)",
//         order: newOrder,
//       });
//     }

//     // ✅ هنا فقط في حالة Stripe
//     return res.status(200).json({
//       message: "Proceed to Stripe payment",
//       orderId: newOrder._id,
//       totalAmount,
//     });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // @desc   Get user's orders
// // @route  GET /api/orders/:userId
// // @access User
// export const getUserOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ userId: req.params.id }).populate(
//     "items.productId"
//   );
//   if (!orders) {
//     return res.status(401).json({ message: "not found any order" });
//   }
//   res.status(200).json({
//     message: "success return all order user",
//     oder: orders.length,
//     orders,
//   });
// });
// // @desc   Get all orders (for admin) or user orders
// // @route  GET /api/orders
// // @access User / Admin
// export const getOrders = asyncHandler(async (req, res) => {
//   const { userId } = req.query;
//   let filter = {};

//   if (userId) {
//     filter.userId = userId;
//   }

//   const orders = await Order.find(filter)
//     .populate({
//       path: "items.productId",
//       select: "Name Price Image",
//     })
//     .populate("userId", "name email")
//     .sort({ createdAt: -1 });

//   if (orders.length === 0)
//     return res.status(404).json({ message: "No orders found" });

//   res.status(200).json({
//     count: orders.length,
//     orders,
//   });
// });

// export const paymentCallback = asyncHandler(async (req, res) => {
//   const { orderId, status } = req.body;

//   const order = await Order.findById(orderId);
//   if (!order) return res.status(404).json({ message: "Order not found" });

//   order.paymentStatus = status === "success" ? "Paid" : "Failed";
//   await order.save();

//   res.status(200).json({ message: "Payment status updated", order });
// });



























import { Product } from "../models/Product.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}
const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      Contact,
      Delivery,
      FirstName,
      LastName,
      Address,
      Apartment,
      PostCode,
      City,
      paymentMethod,
    } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const userCart = await Cart.findOne({ userId }).populate("items.productId");
    if (!userCart || userCart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    // حساب الإجمالي والتحقق من stock
    let totalAmount = 0;
    for (const item of userCart.items) {
      if (!item.productId || item.productId.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${item.productId?.Name || "Unknown"}` });
      }
      totalAmount += item.productId.Price * item.quantity;
    }

    // التأكد إن totalAmount موجود وصحيح
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount, cannot proceed to payment." });
    }

    // تجهيز بيانات الطلب
    const orderData = {
      userId,
      items: userCart.items.map((i) => ({
        productId: i.productId._id,
        Name: i.productId.Name,
        Price: i.productId.Price,
        quantity: i.quantity,
      })),
      totalAmount,
      Contact,
      Delivery,
      FirstName,
      LastName,
      Address,
      Apartment,
      PostCode,
      City,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Paid" : "Pending",
      status: paymentMethod === "Cash" ? "Processing" : "Pending",
    };

    // لو الدفع بطاقة → نعمل Stripe PaymentIntent
    if (paymentMethod === "Card") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "aed",
        metadata: { userId },
      });

      orderData.paymentIntentId = paymentIntent.id;
      orderData.clientSecret = paymentIntent.client_secret;
    }

    // إنشاء الطلب
    const newOrder = await Order.create(orderData);

    // تحديث المخزون
    for (const item of userCart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // حذف الكارت بعد إنشاء الطلب
    await Cart.findOneAndDelete({ userId });

    // الرد على حسب طريقة الدفع
    if (paymentMethod === "Cash") {
      return res.status(201).json({
        message: "Order placed successfully (Cash Payment)",
        order: newOrder,
      });
    }

    // رد للـ Card Payment
    return res.status(200).json({
      message: "Proceed to Stripe payment",
      orderId: newOrder._id,
      totalAmount,
      clientSecret: newOrder.clientSecret,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};





// import {Product} from "../models/Product.js";
// import Stripe from "stripe";
// import dotenv from "dotenv";
// dotenv.config();

// const stripeSecret = process.env.STRIPE_SECRET_KEY;
// if (!stripeSecret) {
//   throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
// }
// const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });



// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//     } = req.body;

//     if (!userId) return res.status(400).json({ message: "User ID is required" });

//     const userCart = await Cart.findOne({ userId }).populate("items.productId");
//     if (!userCart || userCart.items.length === 0)
//       return res.status(400).json({ message: "Your cart is empty" });

//     // حساب الإجمالي
//     let totalAmount = 0;
//     for (const item of userCart.items) {
//       if (item.productId.stock < item.quantity)
//         return res
//           .status(400)
//           .json({ message: `Insufficient stock for product: ${item.productId.Name}` });
//       totalAmount += item.productId.Price * item.quantity;
//     }

//     // حجز المنتجات من المخزون
//     for (const item of userCart.items) {
//       await Product.findByIdAndUpdate(item.productId._id, {
//         $inc: { stock: -item.quantity },
//       });
//     }

//     // تجهيز الطلب
//     const orderData = {
//       userId,
//       items: userCart.items.map((i) => ({
//         productId: i.productId._id,
//         Name: i.productId.Name,
//         Price: i.productId.Price,
//         quantity: i.quantity,
//       })),
//       totalAmount,
//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Cash" ? "Paid" : "Pending",
//       status: paymentMethod === "Cash" ? "Processing" : "Pending",
//     };

//     // لو الدفع بطاقة → نعمل Stripe PaymentIntent
//     if (paymentMethod === "Card") {
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(totalAmount * 100),
//         currency: "aed",
//         metadata: { userId },
//       });

//       orderData.paymentIntentId = paymentIntent.id;
//       orderData.clientSecret = paymentIntent.client_secret;
//     }

//     const newOrder = await Order.create(orderData);

//     // حذف الكارت بعد إنشاء الطلب
//     await Cart.findOneAndDelete({ userId });

//     // الرد
//     if (paymentMethod === "Cash") {
//       return res.status(201).json({
//         message: "Order placed successfully (Cash Payment)",
//         order: newOrder,
//       });
//     }

//     // رد للـ Card Payment
//     return res.status(200).json({
//       message: "Proceed to Stripe payment",
//       orderId: newOrder._id,
//       totalAmount,
//       clientSecret: newOrder.clientSecret,
//     });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// ==================== Get User Orders ====================
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const orders = await Order.find({ userId }).populate("items.productId").sort({ createdAt: -1 });

  if (!orders || orders.length === 0) return res.status(404).json({ message: "No orders found" });

  res.status(200).json({ count: orders.length, orders });
});

// ==================== Get Order By Id ====================
export const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const orderId = req.params.id;

  const order = await Order.findOne({ _id: orderId, userId }).populate("items.productId");
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.status(200).json({ order });
});

// ==================== Update Order Status ====================
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  const userId = req.user?.id;
  const io = req.app.get("io");

  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const order = await Order.findOneAndUpdate(
    { _id: orderId, userId },
    { status },
    { new: true }
  );

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (io) {
    io.to(`user:${userId}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });
  }

  res.status(200).json({ message: "Order status updated", order });
});

// ==================== Stripe Webhook ====================
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const io = req.app.get("io");

  let event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
      return res.status(500).send("Webhook secret not configured");
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let paymentIntent = null;
  let userId = null;

  if (event.type.startsWith("payment_intent.")) {
    paymentIntent = event.data.object;
    userId = paymentIntent.metadata?.userId || null;
  }

  if (!paymentIntent) return res.json({ received: true });

  if (event.type === "payment_intent.succeeded") {
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (!order) return res.json({ received: true });

    order.status = "paid";
    await order.save();

    if (io && userId) {
      io.to(`user:${userId}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: "paid",
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      });
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (!order) return res.json({ received: true });

    order.status = "failed";
    await order.save();

    if (io && userId) {
      io.to(`user:${userId}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: "failed",
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      });
    }
  }

  res.json({ received: true });
});
