import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      minlength: 3,
      required: true,
      trim: true,
    },
    Phone: {
      type: String,
      minlength: 11,
      required: true,
      match: [/^01[0-9]{9}$/, "Invalid Egyptian phone number format"],
    },
    Email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    Message: {
      type: String,
      minlength: 10,
      maxlength: 300,
      required: true,
    },
  },
  { timestamps: true }
);

export const ContactUS = mongoose.model("ContactUS", ContactSchema);
