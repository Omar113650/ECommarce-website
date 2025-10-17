import asyncHandler from "express-async-handler";
import { Brand } from "../models/Brand.js";

// @desc   Create new Brand
// @route  POST /api/brands
// @access Admin
export const createBrand = asyncHandler(async (req, res) => {
  const { Name } = req.body;
  const brand = await Brand.create({ Name });
  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: brand,
  });
});
// @desc   Get all Brands
// @route  GET /api/brands
// @access Public
export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });

  if (brands.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No brands found",
    });
  }
  res.status(200).json({
    success: true,
    count: brands.length,
    data: brands,
  });
});
// @desc   Get single Brand by ID
// @route  GET /api/brands/:id
// @access Public
export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }
  res.status(200).json({
    success: true,
    data: brand,
  });
});
// @desc   Update Brand
// @route  PUT /api/brands/:id
// @access Admin
export const updateBrand = asyncHandler(async (req, res) => {
  const { Name } = req.body;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }
  brand.Name = Name || brand.Name;
  await brand.save();

  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    data: brand,
  });
});
// @desc   Delete Brand
// @route  DELETE /api/brands/:id
// @access Admin
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }
  await brand.deleteOne();
  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
});
