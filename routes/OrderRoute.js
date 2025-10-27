import express from "express";
import {
  createOrder,
  // getUserOrders,
  // getOrders,
  // createOrder,
  getUserOrders,
  getOrderById,
  // updateOrderStatus,
  // handleStripeWebhook,
} from "../controllers/OrderController.js";

import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/create-order", VerifyToken, createOrder);
router.get("/get-user-orders/:id", VerifyToken, getUserOrders);
router.get("/get-order/:id", VerifyTokenAdmin, ValidatedID, getOrderById);

export default router;
