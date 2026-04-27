import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  updateCartQuantity
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart",VerifyToken, addToCart);
router.get("/get-cart", VerifyToken,getCart);
router.delete("/remove/:id", VerifyToken, ValidatedID, removeFromCart);
router.delete("/clear-Cart", VerifyToken, clearCart);
router.patch("/update-quantity/:id",VerifyToken,updateCartQuantity)


export default router;
