import asyncHandler from "express-async-handler";
import { Blog } from "../models/Blog.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (for admins or authorized users)
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, author, Tags } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Product image is required" });
  }
  const uploadResult = await cloudinaryUploadImage(req.file.buffer);
  if (!uploadResult?.secure_url) {
    return res
      .status(500)
      .json({ message: "Failed to upload image to Cloudinary" });
  }
  const blog = await Blog.create({
    title,
    content,
    author,
    Tags,
    Image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});
// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 4;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(),
  ]);

  // عملها ب طريقه اسهل فوق 
  // const total = await Blog.countDocuments();

  res.status(200).json({
    success: true,
    count: blogs.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: blogs,
  });
});
// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = asyncHandler(async (req, res) => {
  const { title, content, Tags } = req.body;
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
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

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.Tags = Tags || blog.Tags;
  blog.Image = imageUpdate;

  const BlogUpdate = await blog.save();

  res.status(200).json({
    message: "Product updated successfully",
    blog: BlogUpdate,
  });
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  // Remove image from Cloudinary
  if (product.Image?.publicId) {
    await cloudinaryRemoveImage(product.Image.publicId);
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});
