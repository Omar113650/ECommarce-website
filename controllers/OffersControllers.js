import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc   Create Offer
// @route  POST /api/Offers
// @access Admin
export const createOffer = asyncHandler(async (req, res) => {
  const { Name, Price, categoryId, available, review, offerType, Brand } =
    req.body;
  // offerType ممكن تبقى "permanent" أو "weekly"

  let imageData = { url: "", publicId: null };

  if (req.file) {
    const result = await cloudinaryUploadImage(req.file.buffer);
    if (!result?.secure_url) {
      return res.status(500).json({ message: "Image upload to cloud failed" });
    }
    imageData = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
  let expiryTime = null;
  if (offerType === "weekly") {
    const now = new Date();
    expiryTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // بعد أسبوع بالضبط
  }

  const newOffer = await Product.create({
    Name,
    Price,
    categoryId,
    available: available || "InStock",
    review: review || 5,
    Image: imageData,
    Time: expiryTime,
    Brand,
  });
  res.status(201).json({
    success: true,
    message: "Offer created successfully",
    offer: newOffer,
  });
});
// @desc Get All Offers
// @route GET /api/Offers
// @access Public
export const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Product.find().populate("categoryId", "name").lean();

  if (offers.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No offers found",
    });
  }
  res.status(200).json({
    success: true,
    count: offers.length,
    data: offers,
  });
});
// @desc Get Weekly Offers
// @route GET /api/Offers/weekly
// @access Public
export const getOffersThisWeek = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Product.find({ Time: { $gte: now } }).populate(
    "categoryId",
    "name"
  );
  if (!offers.length)
    return res.status(404).json({ message: "No weekly offers found" });

  res.status(200).json(offers);
});
// @desc   Update Offer
// @route  PUT /api/Offers/:id
// @access Admin
export const updateOffer = asyncHandler(async (req, res) => {
  const { Name, Price, categoryId, available, review } = req.body;
  const { id } = req.params;

  const offer = await Product.findById(id);
  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  let imageData = offer.Image;
  if (req.file) {
    if (offer.Image?.publicId) {
      await cloudinaryRemoveImage(offer.Image.publicId);
    }

    const uploaded = await cloudinaryUploadImage(req.file.buffer);
    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    imageData = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }
  const updatedOffer = await Product.findByIdAndUpdate(
    id,
    {
      $set: {
        Name: Name || offer.Name,
        Price: Price || offer.Price,
        categoryId: categoryId || offer.categoryId,
        available: available || offer.available,
        review: review || offer.review,
        Image: imageData,
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Offer updated successfully",
    item: updatedOffer,
  });
});
// @desc   Delete Offer
// @route  DELETE /api/Offers/:id
// @access Admin
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Product.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  if (offer.Image?.publicId) {
    await cloudinaryRemoveImage(offer.Image.publicId);
  }

  await offer.deleteOne();
  res.status(200).json({ message: "Offer deleted successfully" });
});
// @desc   Get Top Offers (by lowest price)
// @route  GET /api/Offers/top
// @access Public
export const getTopOffers = asyncHandler(async (req, res) => {
  const offers = await Product.find()
    .sort({ Price: 1 })
    .limit(5)
    .populate("categoryId", "name")
    .lean();

  if (!offers || offers.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No top offers found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Top offers fetched successfully",
    count: offers.length,
    data: offers,
  });
});
