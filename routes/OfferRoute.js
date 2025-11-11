import express from "express";
import {
  createOffer,
  getAllOffers,
  getOffersThisWeek,
  updateOffer,
  deleteOffer,
  getTopOffers,
} from "../controllers/OffersControllers.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
import { ProductValidation } from "../validation/ProductValidation.js";
import { validate } from "../middlewares/Validate.js";
const router = express.Router();

router.post(
  "/add-offer",
  VerifyTokenAdmin,
  validate(ProductValidation),
  upload.single("Image"),
  createOffer
);
router.get("/get-all-offer", getAllOffers);
router.get("/top-offer", VerifyToken, getTopOffers);
router.put("/update-offer/:id", VerifyTokenAdmin, ValidatedID, updateOffer);
router.delete("/:id", VerifyTokenAdmin, ValidatedID, deleteOffer);
router.get("/offer-this-week", getOffersThisWeek);

export default router;
