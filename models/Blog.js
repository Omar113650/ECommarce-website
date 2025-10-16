import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
      minlength: [20, "Content must be at least 20 characters long"],
    },

    Image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },

    author: {
      type: String,
      trim: true,
      default: "Anonymous",
    },

    Tags: {
      type: String,
      enum: [
        "grocery",
        "food",
        "shop",
        "store",
        "shopify",
        "ecommerce",
        "organic",
        "klbtheme",
      ],
      default: "grocery",
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", BlogSchema);
