import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        Name: { type: String, required: true },
        quantity: { type: Number, min: 1 },
        Price: { type: Number },
      },
    ],
    totalAmount: { type: Number },
    Contact: String,
    Delivery: String,
    FirstName: String,
    LastName: String,
    Address: String,
    Apartment: String,
    PostCode: Number,
    City: String,
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card"],
      required: true,
      default: "Cash",
    },
    // paymentStatus: {
    //   type: String,
    //   enum: ["Pending", "Paid", "Failed"],
    //   default: "Pending",
    // },
    paymentStatus: {
  type: String,
  enum: ["Pending", "Processing", "Paid", "Failed"],
  default: "Pending",
},

  },
  { timestamps: true }
);


export const Order = mongoose.model("Order", OrderSchema);
