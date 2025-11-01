import mongoose from "mongoose";

const PaymentLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentReference: { type: String, required: true, unique: true },
    paymentIntentId: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["usd", "egp"], default: "usd" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "fawry", "cash"],
      default: "card",
    },
    customerEmail: { type: String, lowercase: true, trim: true },
    rawResponse: { type: Object },
    webhookVerified: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.model("PaymentLog", PaymentLogSchema);
