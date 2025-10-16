// models/PaymentLog.js
import mongoose from "mongoose";

const PaymentLogSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: null }, // ID الطلب عندك
    paymentReference: { type: String, required: true }, // Stripe Session ID
    paymentIntentId: { type: String }, // Stripe Payment Intent ID
    amount: { type: Number, required: true }, // المبلغ (بالـ USD)
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["paid", "unpaid", "canceled"], default: "unpaid" },
    paymentMethod: { type: String, default: "card" }, // card / paypal (لو ضفت)
    customerEmail: { type: String, default: null },
    rawResponse: { type: Object }, // لو عايز تخزن الـ session كله JSON (Debugging)
  },
  { timestamps: true }
);

export default mongoose.model("PaymentLog", PaymentLogSchema);
