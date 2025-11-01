import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

// @desc    Create Order Automatically from Cart
// @route   POST /api/v1/order
// @access  Private (User)
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

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const userCart = await Cart.findOne({ userId }).populate("items.productId");
    if (!userCart || userCart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    let totalAmount = 0;
    for (const item of userCart.items) {
      if (item.productId.stock < item.quantity)
        return res.status(400).json({
          message: `Insufficient stock for product: ${item.productId.Name}`,
        });
      totalAmount += item.productId.Price * item.quantity;
    }
    for (const item of userCart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }
    // تجهيز الطلب
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

    if (paymentMethod === "Card") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "aed",
        metadata: { userId },
      });

      orderData.paymentIntentId = paymentIntent.id;
      orderData.clientSecret = paymentIntent.client_secret;
    }

    const newOrder = await Order.create(orderData);

    await Cart.findOneAndDelete({ userId });

    if (paymentMethod === "Cash") {
      return res.status(201).json({
        message: "Order placed successfully (Cash Payment)",
        order: newOrder,
      });
    }
    return res.status(200).json({
      message: "Proceed to Stripe payment",
      orderId: newOrder._id,
      totalAmount,
      clientSecret: newOrder.clientSecret,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
// @desc    getUserOrders
// @route   POST /api/v1/order
// @access  Private (User)
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const orders = await Order.find({ userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0)
    return res.status(404).json({ message: "No orders found" });

  res.status(200).json({ count: orders.length, orders });
});

// @desc    getOrderById
// @route   POST /api/v1/order
// @access  Private (User)
export const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const orderId = req.params.id;

  const order = await Order.findOne({ _id: orderId, userId }).populate(
    "items.productId"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.status(200).json({ order });
});
