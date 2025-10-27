import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  // getAllProductInCart,
  clearCart,
  // editCartItem
} from "../controllers/CartController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken,OptionalVerifyToken } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/add-cart",OptionalVerifyToken, addToCart);

// router.get("/get-all-product-in-cart", getAllProductInCart);

// router.get("/get-cart", getCart);
router.get("/get-cart", OptionalVerifyToken,getCart);


// router.delete("/remove-product-From-Cart/:userId/:productId", removeFromCart);
router.delete("/remove/:id", OptionalVerifyToken,removeFromCart);
// itemId
// router.put("/edit/:id", editCartItem);
// itemId


router.delete("/clear-Cart", clearCart);

export default router;

