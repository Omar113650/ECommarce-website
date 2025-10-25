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

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userCart = await Cart.findOne({ userId }).populate("items.productId");
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const totalAmount = userCart.items.reduce((acc, item) => {
      const price = item.productId?.Price || 0;
      return acc + price * item.quantity;
    }, 0);

    const newOrder = await Order.create({
      userId,
      items: userCart.items.map((i) => ({
        productId: i.productId._id,
        Name: i.productId.Name, // ✅ أضف الاسم هنا
        Price: i.productId.Price, // ✅ أضف السعر هنا
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
    });

    await Cart.findOneAndDelete({ userId });

    if (paymentMethod === "Cash") {
      return res.status(201).json({
        message: "Order placed successfully (Cash Payment)",
        order: newOrder,
      });
    }

    // ✅ هنا فقط في حالة Stripe
    return res.status(200).json({
      message: "Proceed to Stripe payment",
      orderId: newOrder._id,
      totalAmount,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// @desc   Get user's orders
// @route  GET /api/orders/:userId
// @access User
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.params.id }).populate(
    "items.productId"
  );
  if (!orders) {
    return res.status(401).json({ message: "not found any order" });
  }
  res.status(200).json({
    message: "success return all order user",
    oder: orders.length,
    orders,
  });
});
// @desc   Get all orders (for admin) or user orders
// @route  GET /api/orders
// @access User / Admin
export const getOrders = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  let filter = {};

  if (userId) {
    filter.userId = userId;
  }

  const orders = await Order.find(filter)
    .populate({
      path: "items.productId",
      select: "Name Price Image",
    })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  if (orders.length === 0)
    return res.status(404).json({ message: "No orders found" });

  res.status(200).json({
    count: orders.length,
    orders,
  });
});

export const paymentCallback = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.paymentStatus = status === "success" ? "Paid" : "Failed";
  await order.save();

  res.status(200).json({ message: "Payment status updated", order });
});
