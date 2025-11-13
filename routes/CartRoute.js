import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken,protect } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart",protect, addToCart);
router.get("/get-cart", protect,getCart);
router.delete("/remove/:id", VerifyToken, ValidatedID, removeFromCart);
router.delete("/clear-Cart", VerifyToken, clearCart);

export default router;
