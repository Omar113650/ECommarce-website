// import express from "express";
// import { createStripeSession } from "../controllers/PaymentController.js";
// import { stripeWebhook } from "../controllers/webhookController.js";
// import { VerifyToken } from "../middlewares/VerifyToken.js";

// const router = express.Router();

// // إنشاء جلسة الدفع
// router.post("/checkout/:orderId", VerifyToken, createStripeSession);

// // Webhook من Stripe
// router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);


// // ✅ صفحة النجاح بعد الدفع
// router.get("/success", (req, res) => {
//   const sessionId = req.query.session_id;

//   res.send(`
//     <html>
//       <head>
//         <title>Payment Success</title>
//         <meta charset="UTF-8" />
//       </head>
//       <body style="font-family: Arial; background: #f9f9f9; text-align: center; padding: 50px;">
//         <h1 style="color: green;">✅ Payment Successful!</h1>
//         <p>Thank you for your payment. Your order is now being processed.</p>
//         <p><strong>Session ID:</strong> ${sessionId}</p>

//         <script>
//           // فحص حالة الدفع كل ثانيتين
//           async function checkStatus() {
//             const res = await fetch('/api/v1/payment/status?session_id=${sessionId}');
//             const data = await res.json();
//             if (data.status === 'paid') {
//               document.querySelector('h1').textContent = '✅ Payment Confirmed';
//             }
//           }
//           setInterval(checkStatus, 2000);
//         </script>

//         <a href="/api/v1/HomePage" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#007bff; color:white; border-radius:8px; text-decoration:none;">Go Home</a>
//       </body>
//     </html>
//   `);
// });

// // ❌ صفحة إلغاء الدفع
// router.get("/cancel", (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>Payment Cancelled</title>
//         <meta charset="UTF-8" />
//       </head>
//       <body style="font-family: Arial; background: #fff; text-align: center; padding: 50px;">
//         <h1 style="color: red;">❌ Payment Cancelled</h1>
//         <p>You have cancelled the payment process. You can try again.</p>
//         <a href="/api/v1/HomePage" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#007bff; color:white; border-radius:8px; text-decoration:none;">Back to Home</a>
//       </body>
//     </html>
//   `);
// });

// // ✅ فحص حالة الدفع
// // router.get("/status", checkPaymentStatus);
// export default router;

































import express from "express";
import { createStripeSession, checkPaymentStatus } from "../controllers/PaymentController.js";
import { stripeWebhook } from "../controllers/webhookController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

// إنشاء جلسة الدفع
router.post("/checkout/:orderId", createStripeSession);

// Webhook من Stripe
router.post("/webhook", stripeWebhook);

// ✅ صفحة النجاح بعد الدفع
router.get("/success", (req, res) => {
  const sessionId = req.query.session_id;

  res.send(`
    <html>
      <head>
        <title>Payment Success</title>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family: Arial; background: #f9f9f9; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Payment Successful!</h1>
        <p>Thank you for your payment. Your order is now being processed.</p>
        <p><strong>Session ID:</strong> ${sessionId}</p>

        <script>
          // فحص حالة الدفع كل ثانيتين
          async function checkStatus() {
            const res = await fetch('/api/v1/payment/status?session_id=${sessionId}');
            const data = await res.json();
            if (data.status === 'paid') {
              document.querySelector('h1').textContent = '✅ Payment Confirmed';
            }
          }
          setInterval(checkStatus, 2000);
        </script>

        <a href="${process.env.CLIENT_URL}/" 
           style="display:inline-block; margin-top:20px; padding:10px 20px; background:#007bff; color:white; border-radius:8px; text-decoration:none;">
           Go Home
        </a>
      </body>
    </html>
  `);
});

// ❌ صفحة إلغاء الدفع
router.get("/cancel", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Payment Cancelled</title>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family: Arial; background: #fff; text-align: center; padding: 50px;">
        <h1 style="color: red;">❌ Payment Cancelled</h1>
        <p>You have cancelled the payment process. You can try again.</p>
        <a href="${process.env.CLIENT_URL}/" 
           style="display:inline-block; margin-top:20px; padding:10px 20px; background:#007bff; color:white; border-radius:8px; text-decoration:none;">
           Back to Home
        </a>
      </body>
    </html>
  `);
});

// ✅ فحص حالة الدفع
router.get("/status", checkPaymentStatus);

export default router;






// :
// الحالة	السلوك
// 🏦 Cash	ينشئ الطلب مباشرة بدون بوابة دفع.
// 💳 Card (Visa)	يفتح جلسة Stripe Checkout ويدفع فعليًا، ثم يتم إنشاء الطلب بعد الدفع الناجح.
// ⚙️ الخطوة الأخيرة (Frontend Integration)

// في صفحة الـ Checkout عندك (زي الصورة اللي بعتها)، خليه لما المستخدم يختار:

// Cash → يرسل طلب /api/v1/payment/checkout مع { paymentMethod: "Cash" }

// Card → نفس الطلب لكن { paymentMethod: "Card" }
// ثم تستخدم window.location = res.data.url; لو رجع URL من Stripe.