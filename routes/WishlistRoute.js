import express from "express";
import {
  toggleFavorite,
  getFavorites,
  DeleteFavorites,
} from "../controllers/WishlistController.js";

import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.post("/add-favorite", VerifyToken, toggleFavorite);
router.get("/get-favorite/:userId", VerifyToken, ValidatedID, getFavorites);
router.delete(
  "/delete-favorite/:productId",
  VerifyToken,
  ValidatedID,
  DeleteFavorites
);

export default router;
