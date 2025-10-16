import express from "express";
import {
  addToCart,
  getUserCart,
  removeFromCart,
  getAllProductInCart,
  clearCart,
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart", addToCart);
router.get("/get-all-product-in-cart", getAllProductInCart);
router.get("/user-cart/:userId", getUserCart);
router.delete("/remove-product-From-Cart/:userId/:productId", removeFromCart);
router.delete("/clear-Cart", clearCart);

export default router;
