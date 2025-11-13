// import asyncHandler from "express-async-handler";
// import { Cart } from "../models/Cart.js";
// import { Product } from "../models/Product.js";
// import mongoose from "mongoose";

// export const addToCart = asyncHandler(async (req, res) => {
//   const { productId, quantity } = req.body;
//   const userId = req.user?.id;
//   const sessionId = req.session.id;

//   if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   const product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   if (product.available === "OutOfStock" || product.stock < quantity) {
//     return res.status(400).json({ message: "Insufficient stock" });
//   }

//   const identifier = userId ? { userId } : { sessionId };

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let cart = await Cart.findOne(identifier).session(session);

//     if (!cart) {
//       cart = await Cart.create(
//         [
//           {
//             ...identifier,
//             items: [{ productId, quantity }],
//           },
//         ],
//         { session }
//       );
//       cart = cart[0];
//     } else {
//       const itemIndex = cart.items.findIndex(
//         (item) => item.productId.toString() === productId
//       );

//       if (itemIndex > -1) {
//         const newQuantity = cart.items[itemIndex].quantity + quantity;
//         if (product.stock < newQuantity) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({ message: "Insufficient stock" });
//         }
//         cart.items[itemIndex].quantity = newQuantity;
//       } else {
//         cart.items.push({ productId, quantity });
//       }

//       await cart.save({ session });
//     }

//     product.stock -= quantity;
//     if (product.stock <= 0) product.available = "OutOfStock";
//     await product.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     const populatedCart = await Cart.findById(cart._id).populate(
//       "items.productId",
//       "Name Price"
//     );

//     let totalPrice = 0;
//     populatedCart.items.forEach((item) => {
//       totalPrice += item.productId.Price * item.quantity;
//     });

//     const formattedCart = {
//       ...populatedCart.toObject(),
//       totalPrice,
//     };

//     res.status(200).json({
//       message: userId
//         ? "Added to user cart successfully"
//         : "Added to guest cart successfully",
//       cart: formattedCart,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error adding to cart:", err.message);
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: err.message });
//   }
// });
// // @desc    Get cart for user or guest
// // @route   GET /api/cart
// // @access  Public/User
// // export const getCart = asyncHandler(async (req, res) => {
// //   const userId = req.user?.id;
// //   const sessionId = req.sessionID;

// //   try {
// //     if (userId) {
// //       const cart = await Cart.findOne({ userId }).populate(
// //         "items.productId",
// //         "Name  Price Image"
// //       );

// //       if (!cart || cart.items.length === 0) {
// //         return res.status(200).json({ message: "Cart is empty", cart: [] });
// //       }

// //       const totalPrice = cart.items.reduce((acc, item) => {
// //         return acc + (item.productId?.Price || 0) * item.quantity;
// //       }, 0);

// //       const items = cart.items.map((item) => ({
// //         id: item._id,
// //         productId: item.productId._id,
// //         name: item.productId.Name,
// //         price: item.productId.Price,
// //         quantity: item.quantity,
// //         Image:item.productId.Image
// //       }));

// //       return res.status(200).json({
// //         message: "User cart fetched successfully",
// //         cart: {
// //           items,
// //           totalPrice,
// //         },
// //       });
// //     }
// //     const guestCart = await Cart.findOne({ sessionId }).populate(
// //       "items.productId",
// //       "Name Price Image"
// //     );

// //     if (!guestCart || guestCart.items.length === 0) {
// //       return res.status(200).json({ message: "Cart is empty", cart: [] });
// //     }

// //     const totalPrice = guestCart.items.reduce((acc, item) => {
// //       return acc + (item.productId?.Price || 0) * item.quantity;
// //     }, 0);

// //     const guestItems = guestCart.items.map((item) => ({
// //       id: item._id,
// //       productId: item.productId._id,
// //       name: item.productId.Name,
// //       price: item.productId.Price,
// //       quantity: item.quantity,
// //       Image:item.productId.Image
// //     }));

// //     return res.status(200).json({
// //       message: "Guest cart fetched successfully",
// //       cart: {
// //         items: guestItems,
// //         totalPrice,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Error getting cart:", err);
// //     res
// //       .status(500)
// //       .json({ message: "Something went wrong", error: err.message });
// //   }
// // });

// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     let cart;
//     let source = "";

//     if (userId) {
//       cart = await Cart.findOne({ userId }).populate("items.productId", "Name Price Image");
//       source = "user";
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).populate("items.productId", "Name Price Image");
//       source = "guest";
//     }

//     // لو مفيش cart أو فاضي، نجيب 10 منتجات عشوائية
//     if (!cart || cart.items.length === 0) {
//       const products = await Product.aggregate([{ $sample: { size: 10 } }]);

//       const items = products.map(p => ({
//         id: p._id,
//         productId: p._id,
//         name: p.Name,
//         price: p.Price,
//         quantity: 1,
//         Image: p.Image
//       }));

//       const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//       return res.status(200).json({
//         message: "Cart fetched successfully (default products)",
//         cart: {
//           items,
//           totalPrice
//         }
//       });
//     }

//     // لو فيه cart موجود
//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     return res.status(200).json({
//       message: source === "user" ? "User cart fetched successfully" : "Guest cart fetched successfully",
//       cart: { items, totalPrice }
//     });

//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });


// // @desc    Remove product from cart (User or Guest)
// // @route   DELETE /api/cart/:id
// // @access  Public/User
// export const removeFromCart = asyncHandler(async (req, res) => {
//   const { id } = req.params; // itemId
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     if (userId) {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) return res.status(404).json({ message: "Cart not found" });

//       const itemIndex = cart.items.findIndex((i) => i._id.toString() === id);
//       if (itemIndex === -1)
//         return res.status(404).json({ message: "Item not found in cart" });

//       const deletedItem = cart.items[itemIndex];
//       cart.items.splice(itemIndex, 1);

//       cart.totalPrice = cart.items.reduce(
//         (acc, item) => acc + item.productId.Price * item.quantity,
//         0
//       );

//       await cart.save();

//       return res.status(200).json({
//         message: "Item removed from cart successfully",
//         deletedItem,
//         totalPrice: cart.totalPrice,
//       });
//     }

//     const guestCart = await Cart.findOne({ sessionId }).populate(
//       "items.productId",
//       "Price"
//     );
//     if (!guestCart)
//       return res.status(404).json({ message: "Guest cart not found" });

//     const itemIndex = guestCart.items.findIndex((i) => i._id.toString() === id);
//     if (itemIndex === -1)
//       return res.status(404).json({ message: "Item not found in guest cart" });

//     const deletedItem = guestCart.items[itemIndex];
//     guestCart.items.splice(itemIndex, 1);

//     guestCart.totalPrice = guestCart.items.reduce(
//       (acc, item) => acc + item.productId.Price * item.quantity,
//       0
//     );

//     await guestCart.save();

//     res.status(200).json({
//       message: "Item removed from guest cart successfully",
//       deletedItem,
//       totalPrice: guestCart.totalPrice,
//     });
//   } catch (err) {
//     console.error("Error removing from cart:", err);
//     res.status(500).json({ message: "Failed to remove from cart" });
//   }
// });

// // // @desc    Remove product from cart (User or Guest)
// // // @route   DELETE /api/cart/:id
// // // @access  Public/User
// // export const removeFromCart = asyncHandler(async (req, res) => {
// //   const { id } = req.params; // itemId
// //   const userId = req.user?.id;
// //   const sessionId = req.sessionID;

// //   try {
// //     // تحديد الكارت حسب user أو guest
// //     const query = userId ? { userId } : { sessionId };
// //     const cart = await Cart.findOne(query).populate("items.productId", "Price Name Image");

// //     if (!cart) {
// //       return res.status(404).json({
// //         message: userId ? "User cart not found" : "Guest cart not found",
// //       });
// //     }

// //     // إيجاد العنصر اللي عايزين نحذفه
// //     const itemIndex = cart.items.findIndex((item) => item._id.toString() === id);

// //     if (itemIndex === -1) {
// //       return res.status(404).json({ message: "Item not found in cart" });
// //     }

// //     // حفظ العنصر اللي هيتشال
// //     const deletedItem = cart.items[itemIndex];

// //     // حذف العنصر من المصفوفة
// //     cart.items.splice(itemIndex, 1);

// //     // حساب السعر الكلي بعد الحذف
// //     cart.totalPrice = cart.items.reduce((acc, item) => {
// //       const price = item.productId?.Price || 0;
// //       const quantity = item.quantity || 1;
// //       return acc + price * quantity;
// //     }, 0);

// //     await cart.save();

// //     // تجهيز باقي العناصر للرد
// //     const items = cart.items.map((item) => ({
// //       id: item._id,
// //       productId: item.productId?._id,
// //       name: item.productId?.Name || "Deleted Product",
// //       price: item.productId?.Price || 0,
// //       quantity: item.quantity,
// //       Image: item.productId?.Image || null,
// //     }));

// //     return res.status(200).json({
// //       message: "Item removed from cart successfully",
// //       deletedItem: {
// //         id: deletedItem._id,
// //         productId: deletedItem.productId?._id,
// //         quantity: deletedItem.quantity,
// //       },
// //       cart: {
// //         items,
// //         totalPrice: cart.totalPrice,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Error removing from cart:", err);
// //     res.status(500).json({
// //       message: "Failed to remove item from cart",
// //       error: err.message,
// //     });
// //   }
// // });



// // @desc   Clear entire cart
// // // @route  DELETE /api/cart/:userId
// // // @access User
// // export const clearCart = asyncHandler(async (req, res) => {
// //   const userId = req.user?.id;

// //   try {
// //     if (userId) {
// //       const cart = await Cart.findOneAndDelete({ userId });
// //       if (!cart) return res.status(404).json({ message: "Cart not found" });

// //       return res.status(200).json({ message: "Cart cleared successfully" });
// //     }

// //     if (!req.session.cart)
// //       return res.status(404).json({ message: "Cart not found" });

// //     req.session.cart = [];
// //     await new Promise((resolve, reject) => {
// //       req.session.save((err) => (err ? reject(err) : resolve()));
// //     });

// //     res.status(200).json({ message: "Cart cleared successfully" });
// //   } catch (err) {
// //     console.error("Error clearing cart:", err);
// //     res.status(500).json({ message: "Failed to clear cart" });
// //   }
// // });



// // @desc    Clear entire cart
// // @route   DELETE /api/cart
// // @access  User/Guest
// export const clearCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     if (userId) {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) return res.status(404).json({ message: "Cart not found" });

//       // نفرغ العناصر بدل ما نمسح الكارت كله
//       cart.items = [];
//       cart.totalPrice = 0;
//       await cart.save();

//       return res.status(200).json({ message: "Cart cleared successfully" });
//     }

//     // للـ guest
//     const guestCart = await Cart.findOne({ sessionId });
//     if (!guestCart) return res.status(404).json({ message: "Cart not found" });

//     guestCart.items = [];
//     guestCart.totalPrice = 0;
//     await guestCart.save();

//     res.status(200).json({ message: "Cart cleared successfully" });
//   } catch (err) {
//     console.error("Error clearing cart:", err);
//     res.status(500).json({ message: "Failed to clear cart" });
//   }
// });








import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc    Add product to cart (User or Guest)
 * @route   POST /api/cart
 * @access  Public/User
 */
// export const addToCart = asyncHandler(async (req, res) => {
//   const { productId, quantity } = req.body;
//   const userId = req.user?.id;
//   const sessionId = req.session.id;

//   if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   const product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   if (product.available === "OutOfStock" || product.stock < quantity) {
//     return res.status(400).json({ message: "Insufficient stock" });
//   }

//   const identifier = userId ? { userId } : { sessionId };

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let cart = await Cart.findOne(identifier).session(session);

//     if (!cart) {
//       cart = await Cart.create(
//         [{ ...identifier, items: [{ productId, quantity }] }],
//         { session }
//       );
//       cart = cart[0];
//     } else {
//       const itemIndex = cart.items.findIndex(
//         (item) => item.productId.toString() === productId
//       );

//       if (itemIndex > -1) {
//         const newQuantity = cart.items[itemIndex].quantity + quantity;
//         if (product.stock < newQuantity) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({ message: "Insufficient stock" });
//         }
//         cart.items[itemIndex].quantity = newQuantity;
//       } else {
//         cart.items.push({ productId, quantity });
//       }

//       await cart.save({ session });
//     }

//     product.stock -= quantity;
//     if (product.stock <= 0) product.available = "OutOfStock";
//     await product.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     const populatedCart = await Cart.findById(cart._id).populate(
//       "items.productId",
//       "Name Price Image"
//     );

//     const totalPrice = populatedCart.items.reduce(
//       (acc, item) => acc + (item.productId?.Price || 0) * item.quantity,
//       0
//     );

//     res.status(200).json({
//       message: userId
//         ? "Added to user cart successfully"
//         : "Added to guest cart successfully",
//       cart: { ...populatedCart.toObject(), totalPrice },
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error adding to cart:", err.message);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });

/**
 * @desc    Get cart for user or guest
 * @route   GET /api/cart
 * @access  Public/User
 */
// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     let cart;
//     let source = "";

//     if (userId) {
//       cart = await Cart.findOne({ userId }).populate("items.productId", "Name Price Image");
//       source = "user";
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).populate("items.productId", "Name Price Image");
//       source = "guest";
//     }

//     if (!cart || cart.items.length === 0) {
//       return res.status(200).json({
//         message: "Cart is empty",
//         cart: { items: [], totalPrice: 0 },
//       });
//     }

//     const items = cart.items.map((item) => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image,
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     res.status(200).json({
//       message: source === "user" ? "User cart fetched successfully" : "Guest cart fetched successfully",
//       cart: { items, totalPrice },
//     });
//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });


// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     let cart;
//     let source = "";

//     if (userId) {
//       cart = await Cart.findOne({ userId }).populate("items.productId", "Name Price Image");
//       source = "user";
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).populate("items.productId", "Name Price Image");
//       source = "guest";
//     }

//     // لو مفيش cart أو فاضي، نجيب 10 منتجات عشوائية
//     if (!cart || cart.items.length === 0) {
//       const products = await Product.aggregate([{ $sample: { size: 10 } }]);

//       const items = products.map(p => ({
//         id: p._id,
//         productId: p._id,
//         name: p.Name,
//         price: p.Price,
//         quantity: 1,
//         Image: p.Image
//       }));

//       const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//       return res.status(200).json({
//         message: "Cart fetched successfully (default products)",
//         cart: {
//           items,
//           totalPrice
//         }
//       });
//     }

//     // لو فيه cart موجود
//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     return res.status(200).json({
//       message: source === "user" ? "User cart fetched successfully" : "Guest cart fetched successfully",
//       cart: { items, totalPrice }
//     });

//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });


// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     const query = userId ? { userId } : { sessionId };
//     const cart = await Cart.findOne(query).populate("items.productId", "Name Price Image");

//     if (!cart || cart.items.length === 0) {
//       return res.status(200).json({
//         message: "Cart is empty",
//         cart: { items: [], totalPrice: 0 }, // كارت فاضي بدون أي default products
//       });
//     }

//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     return res.status(200).json({
//       message: userId ? "User cart fetched successfully" : "Guest cart fetched successfully",
//       cart: { items, totalPrice },
//     });

//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });

// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     const query = userId ? { userId } : { sessionId };
//     const cart = await Cart.findOne(query).populate("items.productId", "Name Price Image");

//     if (!cart || cart.items.length === 0) {
//       return res.status(200).json({
//         message: "Cart fetched successfully",
//         cart: { items: [], totalPrice: 0 }, // فاضي بدون أي default products
//       });
//     }

//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     res.status(200).json({
//       message: "Cart fetched successfully",
//       cart: { items, totalPrice }
//     });
//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });

// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     // نحدد الكارت حسب user أو session
//     const query = userId ? { userId } : { sessionId };
//     let cart = await Cart.findOne(query).populate("items.productId", "Name Price Image");

//     // لو مفيش cart نعمل واحد فاضي مباشرة
//     if (!cart) {
//       cart = await Cart.create({
//         ...(userId ? { userId } : { sessionId }),
//         items: [],
//         totalPrice: 0,
//       });
//     }

//     // نجهز البيانات للرد
//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     res.status(200).json({
//       message: "Cart fetched successfully",
//       cart: { items, totalPrice }
//     });

//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });




// /**
//  * @desc    Remove product from cart (User or Guest)
//  * @route   DELETE /api/cart/:id
//  * @access  Public/User
//  */
// export const removeFromCart = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     const query = userId ? { userId } : { sessionId };
//     const cart = await Cart.findOne(query).populate("items.productId", "Name Price Image");

//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const itemIndex = cart.items.findIndex((item) => item._id.toString() === id);
//     if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

//     const deletedItem = cart.items[itemIndex];
//     cart.items.splice(itemIndex, 1);

//     cart.totalPrice = cart.items.reduce(
//       (acc, item) => acc + (item.productId?.Price || 0) * item.quantity,
//       0
//     );

//     await cart.save();

//     res.status(200).json({
//       message: "Item removed from cart successfully",
//       deletedItem: {
//         id: deletedItem._id,
//         productId: deletedItem.productId?._id,
//         name: deletedItem.productId?.Name,
//         price: deletedItem.productId?.Price,
//         quantity: deletedItem.quantity,
//         Image: deletedItem.productId?.Image,
//       },
//       totalPrice: cart.totalPrice,
//     });
//   } catch (err) {
//     console.error("Error removing from cart:", err);
//     res.status(500).json({ message: "Failed to remove from cart", error: err.message });
//   }
// });

// /**
//  * @desc    Clear entire cart (User or Guest)
//  * @route   DELETE /api/cart
//  * @access  User/Guest
// //  */

// // مسح الكارت بالكامل
// export const clearCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     const query = userId ? { userId } : { sessionId };
//     const cart = await Cart.findOne(query);

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     cart.items = [];
//     cart.totalPrice = 0;
//     await cart.save();

//     res.status(200).json({ message: "Cart cleared successfully" });
//   } catch (err) {
//     console.error("Error clearing cart:", err);
//     res.status(500).json({ message: "Failed to clear cart", error: err.message });
//   }
// });

// // جلب محتوى الكارت
// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;
//   const sessionId = req.sessionID;

//   try {
//     const query = userId ? { userId } : { sessionId };
//     const cart = await Cart.findOne(query).populate("items.productId", "Name Price Image");

//     if (!cart || cart.items.length === 0) {
//       return res.status(200).json({
//         message: "Cart is empty",
//         cart: { items: [], totalPrice: 0 } // فاضي بدون أي default products
//       });
//     }

//     const items = cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image
//     }));

//     const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

//     res.status(200).json({
//       message: userId ? "User cart fetched successfully" : "Guest cart fetched successfully",
//       cart: { items, totalPrice }
//     });
//   } catch (err) {
//     console.error("Error getting cart:", err);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });



























// إضافة منتج للكارت
// export const addToCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id; // لو المستخدم مسجل دخول
//   const { productId, quantity } = req.body;

//   if (!userId) {
//     return res.status(401).json({ message: "User not authenticated" });
//   }

//   if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   const product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   if (product.available === "OutOfStock" || product.stock < quantity) {
//     return res.status(400).json({ message: "Insufficient stock" });
//   }

//   try {
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       // إنشاء كارت جديد للمستخدم
//       cart = await Cart.create({
//         userId,
//         items: [{ productId, quantity }],
//       });
//     } else {
//       const itemIndex = cart.items.findIndex(
//         (item) => item.productId.toString() === productId
//       );

//       if (itemIndex > -1) {
//         const newQuantity = cart.items[itemIndex].quantity + quantity;
//         if (product.stock < newQuantity) {
//           return res.status(400).json({ message: "Insufficient stock" });
//         }
//         cart.items[itemIndex].quantity = newQuantity;
//       } else {
//         cart.items.push({ productId, quantity });
//       }

//       await cart.save();
//     }

//     // تحديث كمية المنتج
//     product.stock -= quantity;
//     if (product.stock <= 0) product.available = "OutOfStock";
//     await product.save();

//     // جلب الكارت بعد populate
//     const populatedCart = await Cart.findById(cart._id).populate(
//       "items.productId",
//       "Name Price Image"
//     );

//     const totalPrice = populatedCart.items.reduce(
//       (acc, item) => acc + item.productId.Price * item.quantity,
//       0
//     );

//     res.status(200).json({
//       message: "Added to cart successfully",
//       cart: {
//         items: populatedCart.items.map((item) => ({
//           id: item._id,
//           productId: item.productId._id,
//           name: item.productId.Name,
//           price: item.productId.Price,
//           quantity: item.quantity,
//           Image: item.productId.Image,
//         })),
//         totalPrice,
//       },
//     });
//   } catch (err) {
//     console.error("Error adding to cart:", err.message);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });


export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.available === "OutOfStock" || product.stock < quantity) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    // تحديث المخزون
    product.stock -= quantity;
    if (product.stock <= 0) product.available = "OutOfStock";
    await product.save();

    // جلب الكارت بعد الـ populate
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "Name Price Image"
    );

    const totalPrice = populatedCart.items.reduce(
      (acc, item) => acc + item.productId.Price * item.quantity,
      0
    );

    res.status(200).json({
      message: "Added to cart successfully",
      cart: {
        items: populatedCart.items.map((item) => ({
          id: item._id,
          productId: item.productId._id,
          name: item.productId.Name,
          price: item.productId.Price,
          quantity: item.quantity,
          Image: item.productId.Image,
        })),
        totalPrice,
      },
    });
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

/**
 * @desc    Get user cart with fallback to 10 random products if empty
 * @route   GET /api/cart
 * @access  Private (User only)
 */
/**
 * @desc    Get user cart - returns real cart or 10 suggested products if empty
 * @route   GET /api/cart
 * @access  Private (User only)
 */
// export const getCart = asyncHandler(async (req, res) => {
//   const userId = req.user?.id;

//   if (!userId) {
//     return res.status(401).json({ message: "User not authenticated" });
//   }

//   try {
//     const cart = await Cart.findOne({ userId }).populate(
//       "items.productId",
//       "Name Price Image"
//     );

//     // لو الكارت فاضي أو مش موجود
//     if (!cart || cart.items.length === 0) {
//       const randomProducts = await Product.aggregate([
//         { $match: { available: "InStock", stock: { $gt: 0 } } },
//         { $sample: { size: 10 } },
//         { $project: { _id: 1, Name: 1, Price: 1, Image: 1 } },
//       ]);

//       const items = randomProducts.map((p) => ({
//         id: p._id,
//         productId: p._id,
//         name: p.Name,
//         price: p.Price,
//         quantity: 1,
//         Image: p.Image,
//         isSuggested: true,
//       }));

//       const totalPrice = items.reduce(
//         (acc, item) => acc + item.price * item.quantity,
//         0
//       );

//       return res.status(200).json({
//         message: "Suggested products (your cart is empty)",
//         cart: {
//           items,
//           totalPrice,
//         },
//       });
//     }

//     // لو فيه كارت
//     const items = cart.items.map((item) => ({
//       id: item._id,
//       productId: item.productId._id,
//       name: item.productId.Name,
//       price: item.productId.Price,
//       quantity: item.quantity,
//       Image: item.productId.Image,
//     }));

//     const totalPrice = items.reduce(
//       (acc, item) => acc + item.price * item.quantity,
//       0
//     );

//     res.status(200).json({
//       message: "Cart fetched successfully",
//       cart: {
//         items,
//         totalPrice,
//       },
//     });
//   } catch (err) {
//     console.error("Error getting cart:", err.message);
//     res.status(500).json({ message: "Something went wrong", error: err.message });
//   }
// });;



export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  // User must be logged in
  if (!userId) {
    return res.status(401).json({
      message: "User not authenticated",
      success: false,
    });
  }

  // Fetch cart
  const cart = await Cart.findOne({ userId })
    .populate("items.productId", "Name Price Image available stock");

  // If no cart OR empty
  if (!cart || cart.items.length === 0) {
    const suggested = await Product.aggregate([
      { $match: { available: "InStock", stock: { $gt: 0 } } },
      { $sample: { size: 10 } },
      { $project: { _id: 1, Name: 1, Price: 1, Image: 1 } },
    ]);

    const items = suggested.map((p) => ({
      id: p._id,
      productId: p._id,
      name: p.Name,
      price: p.Price,
      quantity: 1,
      Image: p.Image,
      isSuggested: true,
    }));

    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return res.status(200).json({
      message: "Cart is empty — showing suggested products",
      success: true,
      cart: {
        items,
        totalPrice,
        count: items.length,
      },
    });
  }

  // If cart has items
  const items = cart.items.map((item) => ({
    id: item._id,
    productId: item.productId._id,
    name: item.productId.Name,
    price: item.productId.Price,
    quantity: item.quantity,
    Image: item.productId.Image,
  }));

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return res.status(200).json({
    message: "Cart fetched successfully",
    success: true,
    cart: {
      items,
      totalPrice,
      count: items.length,
    },
  });
});

/**
 * @desc    Remove item from user cart
 * @route   DELETE /api/cart/:id
 * @access  Private (User only)
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params; // item _id
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((i) => i._id.toString() === id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const deletedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    // إرجاع الكمية للمخزون
    const product = await Product.findById(deletedItem.productId);
    if (product) {
      product.stock += deletedItem.quantity;
      if (product.stock > 0) product.available = "InStock";
      await product.save();
    }

    await cart.save();

    // جلب الكارت بعد التحديث
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "Name Price Image"
    );

    const totalPrice = populatedCart.items.reduce(
      (acc, item) => acc + item.productId.Price * item.quantity,
      0
    );

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: {
        items: populatedCart.items.map((item) => ({
          id: item._id,
          productId: item.productId._id,
          name: item.productId.Name,
          price: item.productId.Price,
          quantity: item.quantity,
          Image: item.productId.Image,
        })),
        totalPrice,
      },
    });
  } catch (err) {
    console.error("Error removing from cart:", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});


/**
 * @desc    Clear entire user cart
 * @route   DELETE /api/cart
 * @access  Private (User only)
 */
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // إرجاع كل الكميات للمخزون
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        if (product.stock > 0) product.available = "InStock";
        await product.save();
      }
    }

    // مسح الكارت
    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart: {
        items: [],
        totalPrice: 0,
      },
    });
  } catch (err) {
    console.error("Error clearing cart:", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

