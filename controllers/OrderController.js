import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";

// @desc   Create Order
// @route  POST /api/orders
// @access User
// export const createOrder = asyncHandler(async (req, res) => {
//   const {
//     userId,
//     items,
//     Contact,
//     Delivery,
//     FirstName,
//     LastName,
//     Address,
//     Apartment,
//     PostCode,
//     City,
//   } = req.body;

//   if (!items || items.length === 0) {
//     return res.status(400).json({ message: "Order items required" });
//   }

//   let total = 0;
//   for (const item of items) {
//     const product = await Product.findById(item.productId);
//     if (!product) throw new Error(`Product not found: ${item.productId}`);
//     total += product.Price * item.quantity;
//   }

//   const order = await Order.create({
//     userId,
//     items: items.map((item) => ({
//       ...item,
//       price: item.price || 0,

//       Contact,
//       Delivery,
//       FirstName,
//       LastName,
//       Address,
//       Apartment,
//       PostCode,
//       City,
//     })),
//     totalAmount: total,
//   });

//   res.status(201).json({ message: "Order placed successfully", order });
// });\




// ============================
// @desc    Create Order & Handle Payment
// @route   POST /api/v1/order
// @access  Private (User)
// ============================
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
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

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder = await Order.create({
      userId,
      items,
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

    // ✅ Cash مباشرة بدون الدفع
    if (paymentMethod === "Cash") {
      return res.status(201).json({
        message: "✅ Order placed successfully (Cash Payment)",
        order: newOrder,
      });
    }

    // 💳 لو Card → نرسل للـ PaymentController
    return res.status(200).json({
      message: "Proceed to Stripe payment",
      orderId: newOrder._id,
      totalAmount,
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




export const paymentCallback = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.paymentStatus = status === "success" ? "Paid" : "Failed";
  await order.save();

  res.status(200).json({ message: "Payment status updated", order });
});




// @desc   Get user's orders
// @route  GET /api/orders/:userId
// @access User
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).populate(
    "items.productId"
  );
  if (!orders) {
    return res.status(401).json({ message: "not found any order" });
  }
  res.status(200).json(orders);
});

// @desc   Get all orders (for admin) or user orders
// @route  GET /api/orders
// @access User / Admin
export const getOrders = asyncHandler(async (req, res) => {
  const { userId } = req.query; // لو جاي من المستخدم
  let filter = {};

  if (userId) {
    filter.userId = userId; // لو المستخدم عايز يشوف طلباته فقط
  }

  const orders = await Order.find(filter)
    .populate({
      path: "items.productId",
      select: "Name Price Image", // الحقول اللي عايز تجيبها من المنتج
    })
    .populate("userId", "name email") // لو عايز تجيب بيانات المستخدم
    .sort({ createdAt: -1 }); // الأحدث أولاً

  if (orders.length === 0)
    return res.status(404).json({ message: "No orders found" });

  res.status(200).json({
    count: orders.length,
    orders,
  });
});
