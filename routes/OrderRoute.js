import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrders,
} from "../controllers/OrderController.js";

import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
const router = express.Router();

router.post("/create-order", VerifyToken, createOrder);
router.get("/get-user-orders", VerifyTokenAdmin, getUserOrders);
router.get("/get-order/:id", VerifyToken, ValidatedID, getOrders);

export default router;
