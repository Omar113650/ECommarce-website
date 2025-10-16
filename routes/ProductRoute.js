import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  AddReviewProduct,
  GetBestseller,
} from "../controllers/ProductsController.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
import { ProductValidation } from "../validation/ProductValidation.js";
import { validate } from "../middlewares/Validate.js";
const router = express.Router();

router.post(
  "/add-product",
  VerifyTokenAdmin,
  validate(ProductValidation),
  upload.single("Image"),
  createProduct
);
router.get("/get-all-product", VerifyToken, getAllProducts);
router.get("/get-product/:id", VerifyToken, ValidatedID, getProductById);
router.put("/update-product/:id", VerifyTokenAdmin, ValidatedID, updateProduct);
router.delete(
  "/delete-product/:id",
  VerifyTokenAdmin,
  ValidatedID,
  deleteProduct
);
router.get(
  "/category/:categoryId",
  VerifyToken,
  ValidatedID,
  getProductsByCategory
);

router.post("/add-review-product/:id", VerifyToken, AddReviewProduct);
router.get("/get-bestseller", VerifyToken, GetBestseller);

export default router;
