import express from "express";
import {
  toggleFavorite,
  getFavorites,
  DeleteFavorites,
  getTopFavoritesProduct,
} from "../controllers/WishlistController.js";


import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.post("/add-favorite", VerifyToken, toggleFavorite);
router.get("/get-favorite/:id", VerifyToken, getFavorites);
router.delete(
  "/delete-favorite/:userId",
  VerifyToken,
  DeleteFavorites
);
router.get("/get-top-favorite-product", VerifyToken, getTopFavoritesProduct);

export default router;

