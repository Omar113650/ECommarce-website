import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/BlogController.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middlewares/validateID.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
import { validate } from "../middlewares/Validate.js";
import { BlogValidation } from "../validation/BlogValidation.js";
const router = express.Router();

router.post(
  "/add-Blog",
  VerifyToken,
  validate(BlogValidation),
  upload.single("Image"),
  createBlog
);
router.get("/get-all-blog", VerifyToken, getAllBlogs);
router.get("/:id", VerifyToken, ValidatedID, getBlogById);
router.put("/update-blog/:id", VerifyToken, ValidatedID, updateBlog);
router.delete("/delete-blog/:id", VerifyToken, ValidatedID, deleteBlog);

export default router;
