import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken,VerifyToken1 } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart",VerifyToken1, addToCart);
router.get("/get-cart", VerifyToken1,getCart);
router.delete("/remove/:id", VerifyToken, ValidatedID, removeFromCart);
router.delete("/clear-Cart", VerifyToken, clearCart);

export default router;
