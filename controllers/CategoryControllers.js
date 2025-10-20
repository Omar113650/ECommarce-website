import asyncHandler from "express-async-handler";
import { Category } from "../models/Category.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc   create category
// @route  GET /api/category
// @access Private
export const CreateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Product image is required" });
  }
  const uploadResult = await cloudinaryUploadImage(req.file.buffer);
  if (!uploadResult?.secure_url) {
    return res
      .status(500)
      .json({ message: "Failed to upload image to Cloudinary" });
  }
  const category = await Category.create({ name: name.trim() });

  res.status(201).json({
    message: "Category created successfully",
    category,
    Image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });
});
// @desc   Get all category
// @route  GET /api/category
// @access Public
export const GetCategory = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const query = {};

  if (name) {
    name = name;
    if (
      [
        "Beverages",
        "Biscuits & Snacks",
        "Breads & Bakery",
        "Breakfast & Dairy",
        "Frozen Foods",
        "Fruits & Vegetables",
        "Grocery & Staples",
        "Meats & Seafood",
      ].includes(name)
    ) {
      query.name = name;
    }
  }
  const categories = await Category.find().sort({ createdAt: -1 });

  if (!categories.length) {
    return res.status(404).json({ message: "No categories found" });
  }
  res.status(200).json({
    message: "Categories fetched successfully",
    total: categories.length,
    categories,
  });
});
// @desc   delete all category
// @route  GET /api/category
// @access Public
export const DeleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Remove image from Cloudinary
  if (product.Image?.publicId) {
    await cloudinaryRemoveImage(product.Image.publicId);
  }
  await Category.findByIdAndDelete(categoryId);

  res.status(200).json({
    message: "Category deleted successfully",
    deletedId: categoryId,
  });
});
// @desc   update all category
// @route  GET /api/category
// @access Public
export const UpdateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  const duplicate = await Category.findOne({ name: name.trim() });
  if (duplicate && duplicate._id.toString() !== categoryId) {
    return res.status(409).json({ message: "Category name already in use" });
  }

  let imageUpdate = product.Image;
  if (req.file) {
    if (product.Image?.publicId) {
      await cloudinaryRemoveImage(product.Image.publicId);
    }

    const uploadedImage = await cloudinaryUploadImage(req.file.buffer);
    if (!uploadedImage?.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }
    imageUpdate = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }
  category.name = name.trim();
  await category.save();

  res.status(200).json({
    message: "Category updated successfully",
    category,
  });
});
