import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// @desc   Add product to cart
// @route  POST /api/cart
// @access User
export const addToCart = asyncHandler(async (req, res) => {
  const { userId, productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

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
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
  }

  res.status(200).json({ message: "Added to cart successfully", cart });
});
// @desc   Get user's cart
// @route  GET /api/cart/:userId
// @access User
export const getUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate(
    "items.productId"
  );
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  res.status(200).json(cart);
});
// @desc   Get user's cart
// @route  GET /api/cart/:userId
// @access User
export const getAllProductInCart = asyncHandler(async (req, res) => {
  const ProductCart = await Cart.find().populate("items.productId");

  if (!ProductCart || ProductCart.length === 0) {
    return res.status(404).json({ message: "No carts found" });
  }

  res.status(200).json(ProductCart);
});

// @desc   Remove product from cart
// @route  DELETE /api/cart/:userId/:productId
// @access User
export const removeFromCart = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();

  res.status(200).json({ message: "Item removed", cart });
});

// @desc   Clear entire cart
// @route  DELETE /api/cart/:userId
// @access User
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.params.userId });
  res.status(200).json({ message: "Cart cleared successfully" });
});
