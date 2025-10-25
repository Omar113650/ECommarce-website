// import mongoose from "mongoose";

// const PaymentLogSchema = new mongoose.Schema(
//   {
//     orderId: { type: String, default: null }, // ID الطلب عندك
//     paymentReference: { type: String, required: true }, // Stripe Session ID
//     paymentIntentId: { type: String }, // Stripe Payment Intent ID
//     amount: { type: Number, required: true }, // المبلغ (بالـ USD)
//     currency: { type: String, default: "usd" },
//     status: {
//       type: String,
//       enum: ["paid", "unpaid", "canceled"],
//       default: "unpaid",
//     },
//     paymentMethod: { type: String, default: "card" }, // card / paypal (لو ضفت)
//     customerEmail: { type: String, default: null },
//     rawResponse: { type: Object }, // لو عايز تخزن الـ session كله JSON (Debugging)
//   },
//   { timestamps: true }
// );

// export default mongoose.model("PaymentLog", PaymentLogSchema);











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
    webhookVerified: { type: Boolean, default: false }, // لتأكيد إنك استقبلت webhook آمن
  },
  { timestamps: true }
);

export default mongoose.model("PaymentLog", PaymentLogSchema);
