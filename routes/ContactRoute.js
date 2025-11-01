import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/ContactusController.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { validate } from "../middlewares/Validate.js";
import { VerifyToken, VerifyTokenAdmin } from "../middlewares/VerifyToken.js";
import { ContactUsValidation } from "../validation/ContactUsValidation.js";
const router = express.Router();

router.post(
  "/add-ContactUs",
  VerifyToken,
  validate(ContactUsValidation),
  createContact
);
router.get("/get-all-Message", VerifyTokenAdmin, getAllContacts);
router.get("/:id", VerifyTokenAdmin, ValidatedID, getContactById);
router.put("/update-message/:id", VerifyToken, ValidatedID, updateContact);
router.delete("/:id", VerifyToken,ValidatedID, deleteContact);

export default router;
