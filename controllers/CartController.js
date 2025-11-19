import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// @desc    Add product to user cart
// @route   POST /api/v1/cart/add
// @access  Private (User only)
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  // Validate user
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Validate input
  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.available === "OutOfStock" || product.stock < quantity) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  // Handle cart
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity }],
    });
  } else {
    // Check if product exists in cart
    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index > -1) {
      const newQuantity = cart.items[index].quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      cart.items[index].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
  }

  // Update stock
  product.stock -= quantity;
  if (product.stock <= 0) product.available = "OutOfStock";
  await product.save();

  // Populate cart
  const populatedCart = await Cart.findById(cart._id).populate(
    "items.productId",
    "Name Price Image"
  );

  // Calculate total price
  const totalPrice = populatedCart.items.reduce(
    (acc, item) => acc + item.productId.Price * item.quantity,
    0
  );

  // Final response
  return res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

/**
 * @desc    Get user cart with fallback to 10 random products if empty
 * @route   GET /api/cart
 * @access  Private (User only)
 */
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  // Get cart with products
  let cart = await Cart.findOne({ userId }).populate(
    "items.productId",
    "Name Price Image available stock"
  );

  // If empty → suggestions
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
      success: true,
      message: "Cart is empty — showing suggested products",
      cart: {
        items,
        totalPrice,
        count: items.length,
      },
    });
  }

  // 🔥 Fix: delete items that reference deleted products
  cart.items = cart.items.filter((item) => item.productId !== null);
  await cart.save();

  // Format items
  const items = cart.items.map((item) => ({
    id: item._id,
    productId: item.productId?._id || null,
    name: item.productId?.Name || "Unknown Product",
    price: item.productId?.Price || 0,
    quantity: item.quantity,
    Image: item.productId?.Image || null,
  }));

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    cart: {
      items,
      totalPrice,
      count: items.length,
    },
  });
});

// @desc    Increase or Decrease item quantity in cart
// @route   PATCH /api/v1/cart/update-quantity/:id?action=increase|decrease
// @access  Private (User only)
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { id } = req.params; // cart item _id
  const { action } = req.query; // increase | decrease
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex((i) => i._id.toString() === id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  const item = cart.items[itemIndex];
  const product = await Product.findById(item.productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // ========== Increase Quantity ==========
  if (action === "increase") {
    // لو مفيش مخزون مش هينفع نزود
    if (product.stock <= 0) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    item.quantity += 1;
    product.stock -= 1;

    if (product.stock === 0) product.available = "OutOfStock";

    await product.save();
  }

  // ========== Decrease Quantity ==========
  else if (action === "decrease") {
    // لو الكمية 1 → هنحذف العنصر نهائيًا
    if (item.quantity === 1) {
      product.stock += 1;
      product.available = "InStock";
      await product.save();

      cart.items.splice(itemIndex, 1);
    } else {
      item.quantity -= 1;
      product.stock += 1;
      product.available = "InStock";
      await product.save();
    }
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }

  await cart.save();

  // Populate After Update
  const populatedCart = await Cart.findById(cart._id).populate(
    "items.productId",
    "Name Price Image"
  );

  const totalPrice = populatedCart.items.reduce(
    (acc, item) => acc + item.productId.Price * item.quantity,
    0
  );

  res.status(200).json({
    message: "Cart updated successfully",
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
});
