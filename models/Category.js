import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      enum: [
        "Beverages",
        "Biscuits & Snacks",
        "Breads & Bakery",
        "Breakfast & Dairy",
        "Frozen Foods",
        "Fruits & Vegetables",
        "Grocery & Staples",
        "Meats & Seafood",
      ],
    },

    Image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", CategorySchema);
