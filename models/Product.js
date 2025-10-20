import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },

    Image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    Brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    available: {
      type: String,
      enum: ["InStock", "OutOfStock"],
      default: "InStock",
    },

    Price: {
      type: Number,
      required: true,
      min: 0,
    },

    review: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    Time: {
      type: Date, // وقت انتهاء العرض
      default: null,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchema);
