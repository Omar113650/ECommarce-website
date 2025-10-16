import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/BrandController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
import { validate } from "../middlewares/Validate.js";
import { BrandValidate } from "../validation/BrandValidation.js";
const router = express.Router();

router.post(
  "/add-Brand",
  VerifyTokenAdmin,
  validate(BrandValidate),
  createBrand
);
router.get("/get-all-brand", VerifyToken, getAllBrands);
router.get("/:id", VerifyToken, ValidatedID, getBrandById);
router.put("/update-brand/:id", VerifyTokenAdmin, ValidatedID, updateBrand);
router.delete("/:id", VerifyTokenAdmin, ValidatedID, deleteBrand);

export default router;
