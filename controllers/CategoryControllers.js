import asyncHandler from "express-async-handler";
import { Category } from "../models/Category.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc   create  category
// @route  GET /api/category
// @access private
export const CreateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Category image is required" });
  }

  // Upload Image to Cloudinary
  const uploadResult = await cloudinaryUploadImage(req.file.buffer);
  if (!uploadResult?.secure_url) {
    return res
      .status(500)
      .json({ message: "Failed to upload image to Cloudinary" });
  }

  // Create category WITH image data
  const category = await Category.create({
    name: name.trim(),
    Image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });

  res.status(201).json({
    message: "Category created successfully",
    category,
  });
});
// @desc   get all category
// @route  GET /api/category
// @access Public
export const GetCategory = asyncHandler(async (req, res) => {
  let { name } = req.query;
  const query = {};

  // فلترة بالاسم لو موجود
  if (name?.trim()) {
    query.name = { $regex: name.trim(), $options: "i" };
  }

  // نرجع فقط (name , Image) بدون أي بيانات زيادة
  const categories = await Category.find(query, { name: 1, Image: 1 }).sort({
    createdAt: -1,
  });

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
// @access private
export const DeleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Delete image from Cloudinary if exists
  if (category.Image?.publicId) {
    await cloudinaryRemoveImage(category.Image.publicId);
  }

  await category.deleteOne();

  return res.status(200).json({
    message: "Category deleted successfully",
    deletedId: id,
  });
});
// @desc   update all category
// @route  GET /api/category
// @access private
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
