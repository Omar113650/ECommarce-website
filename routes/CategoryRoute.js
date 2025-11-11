import express from "express";
import {
  CreateCategory,
  GetCategory,
  DeleteCategory,
  UpdateCategory,
} from "../controllers/CategoryControllers.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { validate } from "../middlewares/Validate.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
import { CategoryValidate } from "../validation/CategoryValidation.js";
const router = express.Router();

// router.get("/count/total", Count);
router.post(
  "/add-category",
  // VerifyTokenAdmin,
  validate(CategoryValidate),
  upload.single("Image"),
  CreateCategory
);
// VerifyToken
router.get("/get-category", GetCategory);
router.put(
  "/update-category/:categoryId",
  VerifyTokenAdmin,
  ValidatedID,
  UpdateCategory
);
router.delete(
  "/delete-category/:id",
  VerifyTokenAdmin,
  ValidatedID,
  DeleteCategory
);

export default router;
