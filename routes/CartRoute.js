import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { OptionalVerifyToken } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart", addToCart);
router.get("/get-cart", OptionalVerifyToken, getCart);
router.delete("/remove/:id", OptionalVerifyToken, ValidatedID, removeFromCart);
router.delete("/clear-Cart", OptionalVerifyToken, clearCart);

export default router;
