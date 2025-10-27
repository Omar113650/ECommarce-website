import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

import mongoose from "mongoose";


// @desc   Add product to cart
// @route  POST /api/cart
// @access User
// export const addToCart = asyncHandler(async (req, res) => {
//   const { userId, productId, quantity } = req.body;

//   const product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   let cart = await Cart.findOne({ userId });

//   if (!cart) {
//     cart = await Cart.create({
//       userId,
//       items: [{ productId, quantity }],
//     });
//   } else {
//     const itemIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (itemIndex > -1) {
//       cart.items[itemIndex].quantity += quantity;
//     } else {
//       cart.items.push({ productId, quantity });
//     }

//     await cart.save();
//   }

//   res.status(200).json({ message: "Added to cart successfully", cart });
// });

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id; // المستخدم المسجل
  const sessionId = req.session.id; // الزائر (sessionId فريد)

  // ✅ تحقق من المدخلات
  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // ✅ جلب المنتج والتحقق من وجوده
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.available === "OutOfStock" || product.stock < quantity) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  // 🧭 تحديد نوع المستخدم (user أو guest)
  const identifier = userId ? { userId } : { sessionId };

  // ✅ بدء Transaction لضمان التكامل
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 📦 الحصول على الكارت للمستخدم أو الزائر
    let cart = await Cart.findOne(identifier).session(session);

    if (!cart) {
      // إنشاء كارت جديد لو مش موجود
      cart = await Cart.create(
        [
          {
            ...identifier,
            items: [{ productId, quantity }],
          },
        ],
        { session }
      );
      cart = cart[0];
    } else {
      // ✅ تحقق إذا المنتج موجود بالفعل في الكارت
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "Insufficient stock" });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save({ session });
    }

    // ✅ تحديث المخزون (stock)
    product.stock -= quantity;
    if (product.stock <= 0) product.available = "OutOfStock";
    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    // ✅ حساب الإجمالي الكلي فقط (بدون Subtotal)
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.productId", "Name Price");

    let totalPrice = 0;
    populatedCart.items.forEach((item) => {
      totalPrice += item.productId.Price * item.quantity;
    });

    const formattedCart = {
      ...populatedCart.toObject(),
      totalPrice,
    };

    res.status(200).json({
      message: userId
        ? "Added to user cart successfully"
        : "Added to guest cart successfully",
      cart: formattedCart,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding to cart:", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});


// // @desc   Get user's cart
// // @route  GET /api/cart/:userId
// // @access User
// export const getCart = asyncHandler(async (req, res) => {
//   const cart = await Cart.findOne({ userId: req.params.userId }).populate(
//     "items.productId"
//   );
//   if (!cart) return res.status(404).json({ message: "Cart not found" });

//   res.status(200).json(cart);
// });
// // @desc   Get user's cart
// // @route  GET /api/cart/:userId
// // @access User
// export const getAllProductInCart = asyncHandler(async (req, res) => {
//   const ProductCart = await Cart.find().populate("items.productId");

//   if (!ProductCart || ProductCart.length === 0) {
//     return res.status(404).json({ message: "No carts found" });
//   }

//   res.status(200).json(ProductCart);
// });

// // @desc   Remove product from cart
// // @route  DELETE /api/cart/:userId/:productId
// // @access User
// export const removeFromCart = asyncHandler(async (req, res) => {
//   const { userId, productId } = req.params;

//   const cart = await Cart.findOne({ userId });
//   if (!cart) return res.status(404).json({ message: "Cart not found" });

//   cart.items = cart.items.filter(
//     (item) => item.productId.toString() !== productId
//   );

//   await cart.save();

//   res.status(200).json({ message: "Item removed", cart });
// });

// // @desc   Clear entire cart
// // @route  DELETE /api/cart/:userId
// // @access User
// export const clearCart = asyncHandler(async (req, res) => {
//   await Cart.findOneAndDelete({ userId: req.params.userId });
//   res.status(200).json({ message: "Cart cleared successfully" });
// });







// ======================= GET CART =======================
// @desc    Get cart for user or guest
// @route   GET /api/cart
// @access  Public/User
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.sessionID;

  try {
    // ==================== لو المستخدم مسجل ====================
    if (userId) {
      const cart = await Cart.findOne({ userId }).populate(
        "items.productId",
        "Name  Price"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(200).json({ message: "Cart is empty", cart: [] });
      }

      // ✅ احسب التوتال الحقيقي
      const totalPrice = cart.items.reduce((acc, item) => {
        return acc + (item.productId?.Price || 0) * item.quantity;
      }, 0);

      const items = cart.items.map((item) => ({
        id: item._id,
        productId: item.productId._id,
        name: item.productId.Name,
        price: item.productId.Price,
        quantity: item.quantity,
      }));

      return res.status(200).json({
        message: "User cart fetched successfully",
        cart: {
          items,
          totalPrice, // ✅ نرجع الناتج الحقيقي هنا
        },
      });
    }

    // ==================== لو الزائر ====================
    const guestCart = await Cart.findOne({ sessionId }).populate(
      "items.productId",
      "Name Price"
    );

    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({ message: "Cart is empty", cart: [] });
    }

    // ✅ احسب التوتال الحقيقي للزائر برضه
    const totalPrice = guestCart.items.reduce((acc, item) => {
      return acc + (item.productId?.Price || 0) * item.quantity;
    }, 0);

    const guestItems = guestCart.items.map((item) => ({
      id: item._id,
      productId: item.productId._id,
      name: item.productId.Name,
      price: item.productId.Price,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      message: "Guest cart fetched successfully",
      cart: {
        items: guestItems,
        totalPrice, // ✅ القيمة المحسوبة يدويًا
      },
    });
  } catch (err) {
    console.error("Error getting cart:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});



// ======================= REMOVE ITEM =======================
// @desc    Remove product from cart (User or Guest)
// @route   DELETE /api/cart/:id
// @access  Public/User
export const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params; // itemId
  const userId = req.user?.id;
  const sessionId = req.sessionID;

  try {
    // ==================== لو المستخدم مسجل ====================
    if (userId) {
      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const itemIndex = cart.items.findIndex((i) => i._id.toString() === id);
      if (itemIndex === -1)
        return res.status(404).json({ message: "Item not found in cart" });

      const deletedItem = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);

      // ✅ تحديث السعر الكلي بعد الحذف
      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.productId.Price * item.quantity,
        0
      );

      await cart.save();

      return res.status(200).json({
        message: "Item removed from cart successfully",
        deletedItem,
        totalPrice: cart.totalPrice,
      });
    }

    // ==================== لو الزائر ====================
    const guestCart = await Cart.findOne({ sessionId }).populate(
      "items.productId",
      "Price"
    );
    if (!guestCart)
      return res.status(404).json({ message: "Guest cart not found" });

    const itemIndex = guestCart.items.findIndex(
      (i) => i._id.toString() === id
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found in guest cart" });

    const deletedItem = guestCart.items[itemIndex];
    guestCart.items.splice(itemIndex, 1);

    // ✅ تحديث السعر الكلي بعد الحذف
    guestCart.totalPrice = guestCart.items.reduce(
      (acc, item) => acc + item.productId.Price * item.quantity,
      0
    );

    await guestCart.save();

    res.status(200).json({
      message: "Item removed from guest cart successfully",
      deletedItem,
      totalPrice: guestCart.totalPrice,
    });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

// // ======================= EDIT ITEM =======================
// export const editCartItem = asyncHandler(async (req, res) => {
//   const { id } = req.params; // itemId
//   const { quantity } = req.body;
//   const userId = req.user?.id;

//   if (!Number.isInteger(quantity) || quantity <= 0) {
//     return res
//       .status(400)
//       .json({ message: "Invalid input: positive quantity required" });
//   }

//   try {
//     if (userId) {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) return res.status(404).json({ message: "Cart not found" });

//       const item = cart.items.find((i) => i._id.toString() === id);
//       if (!item) return res.status(404).json({ message: "Item not found" });

//       const product = await Product.findById(item.productId);
//       if (product.stock < quantity) {
//         return res
//           .status(400)
//           .json({ message: "Insufficient stock for updated quantity" });
//       }

//       item.quantity = quantity;
//       await cart.save();

//       res.status(200).json({
//         message: "Cart item updated successfully",
//         item,
//       });
//     } else {
//       if (!req.session.cart)
//         return res.status(404).json({ message: "Cart not found" });

//       const item = req.session.cart.find((i) => i.id === id);
//       if (!item) return res.status(404).json({ message: "Item not found" });

//       const product = await Product.findById(item.productId);
//       if (product.stock < quantity) {
//         return res
//           .status(400)
//           .json({ message: "Insufficient stock for updated quantity" });
//       }

//       item.quantity = quantity;
//       await new Promise((resolve, reject) => {
//         req.session.save((err) => (err ? reject(err) : resolve()));
//       });

//       res.status(200).json({
//         message: "Cart item updated successfully",
//         item,
//       });
//     }
//   } catch (err) {
//     console.error("Error editing cart item:", err);
//     res.status(500).json({ message: "Failed to update cart item" });
//   }
// });

// ======================= CLEAR CART =======================
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  try {
    if (userId) {
      const cart = await Cart.findOneAndDelete({ userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      return res.status(200).json({ message: "Cart cleared successfully" });
    }

    if (!req.session.cart)
      return res.status(404).json({ message: "Cart not found" });

    req.session.cart = [];
    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});
