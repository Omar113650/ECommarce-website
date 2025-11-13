// import mongoose from "mongoose";

// const CartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//           default: 1,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// export const Cart = mongoose.model("Cart", CartSchema);



// import mongoose from "mongoose";

// const CartSchema = new mongoose.Schema(
//   {
//     // 🧍‍♂️ المستخدم المسجل (لو موجود)
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: false, // بقى اختياري عشان ندعم الزوار
//     },

//     // 🧾 للزوار فقط (نقدر نخزن رقم الجلسة أو التوكن)
//     sessionId: {
//       type: String,
//       required: false,
//       index: true,
//     },

//     // 🛒 العناصر داخل الكارت
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//           default: 1,
//         },
        
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // 🧮 ممكن نضيف دالة مساعدة لحساب عدد العناصر بسرعة
// CartSchema.methods.totalItems = function () {
//   return this.items.reduce((sum, item) => sum + item.quantity, 0);
// };

// export const Cart = mongoose.model("Cart", CartSchema);








// models/Cart.js
import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", CartSchema);