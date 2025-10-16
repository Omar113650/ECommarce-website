import mongoose from "mongoose";

const googleSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
  name: String,
  picture: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GoogleUser = mongoose.model("GoogleUser", googleSchema);
