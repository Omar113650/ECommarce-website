import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      enum: ["Frito Lay", "Quaker", "Cola", "Orea", "Welchs"],
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", BrandSchema);
