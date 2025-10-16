import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc   Create new product
// @route  POST /api/product
// @access Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { Name, Price, available, categoryId, Brand } = req.body;

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
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

  const product = await Product.create({
    Name,
    Price,
    available,
    Brand,
    categoryId,
    Image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// @desc    Get all products with search, filter & pagination
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  let {
    keyword,
    available,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Search by keyword in Name
  if (keyword) {
    query.Name = { $regex: keyword, $options: "i" };
  }

  // Filter by availability
  if (available) {
    available =
      available.charAt(0).toUpperCase() + available.slice(1).toLowerCase();
    if (["InStock", "OutOfStock"].includes(available)) {
      query.available = available;
    }
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.Price = {};
    if (minPrice) query.Price.$gte = Number(minPrice);
    if (maxPrice) query.Price.$lte = Number(maxPrice);
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(query)
    .populate("categoryId", "Name")
    .populate("Brand", "Name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.status(200).json({
    message: "Products fetched successfully",
    total,
    page: Number(page),
    limit: Number(limit),
    products,
  });
});
// export const getAllProducts = asyncHandler(async (req, res) => {
//   let { keyword, available, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
//   const query = {};

//   if (keyword) query.Name = { $regex: sanitizeInput(keyword), $options: "i" };
//   if (available && ["InStock", "OutOfStock"].includes(available)) query.available = available;
//   if (minPrice || maxPrice) {
//     query.Price = {};
//     if (minPrice) query.Price.$gte = Number(minPrice);
//     if (maxPrice) query.Price.$lte = Number(maxPrice);
//   }

//   const skip = (Number(page) - 1) * Number(limit);
//   const [products, total] = await Promise.all([
//     Product.find(query)
//       .populate("categoryId", "Name")
//       .populate("Brand", "Name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Product.countDocuments(query),
//   ]);

//   res.status(200).json({
//     success: true,
//     total,
//     page: Number(page),
//     limit: Number(limit),
//     data: products,
//   });
// });

// @desc   Get product by ID
// @route  GET /api/product/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "categoryId",
    "name"
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    message: "Product fetched successfully",
    product,
  });
});

// @desc   Update product
// @route  PUT /api/product/:id
// @access Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { Name, Price, available, categoryId, Brand } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check if category exists if provided
  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  // Handle image update if provided
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

  product.Name = Name || product.Name;
  product.Price = Price || product.Price;
  product.available = available ?? product.available;
  product.categoryId = categoryId || product.categoryId;
  product.Brand = Brand || product.Brand;
  product.Image = imageUpdate;

  const updatedProduct = await product.save();

  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// @desc   Delete product
// @route  DELETE /api/product/:id
// @access Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Remove image from Cloudinary
  if (product.Image?.publicId) {
    await cloudinaryRemoveImage(product.Image.publicId);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    deletedId: id,
  });
});

// @desc   Get products by category
// @route  GET /api/product/category/:categoryId
// @access Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const products = await Product.find({ categoryId });

  if (!products || products.length === 0) {
    return res
      .status(404)
      .json({ message: "No products found for this category" });
  }

  res.status(200).json({
    message: "Products fetched successfully",
    category: categoryExists.name,
    total: products.length,
    products,
  });
});

// @desc User Add Review
// @route  GET /api/product/add-review
// @access Public
export const AddReviewProduct = asyncHandler(async (req, res) => {
  const { review } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!review || ![1, 2, 3, 4, 5].includes(review)) {
    return res.status(400).json({
      message: "Review must be a number between 1 and 5",
    });
  }

  product.review = review;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Review added successfully",
    product,
  });
});
// @desc  Get Bestseller
// @route  GET /api/product/best-seller
// @access Public
export const GetBestseller = asyncHandler(async (req, res) => {
  const bestSellers = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $sort: { totalSold: -1 } },
    { $limit: 6 },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.Name",
        price: "$product.Price",
        image: "$product.Image.url",
        totalSold: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: bestSellers.length,
    data: bestSellers,
  });
});
