import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
      unique: true,
      match: [/^01[0-9]{9}$/, "Invalid Egyptian phone number format"],
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    Password: {
      type: String,
      minlength: 8,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Customer"],
      default: "Customer",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
