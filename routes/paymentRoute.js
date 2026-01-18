import express from "express";

import {
  createStripeSession,
  checkPaymentStatus,
} from "../controllers/PaymentController.js";

import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.post("/checkout/:orderId", VerifyToken, createStripeSession);

router.get("/success", (req, res) => {
  const sessionId = req.query.session_id;

  res.send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #e0f7fa, #ffffff);
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .card {
          background: white;
          padding: 40px 60px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
          animation: fadeIn 0.8s ease;
        }
        h1 {
          color: #28a745;
          margin-bottom: 10px;
        }
        p {
          color: #333;
          margin: 8px 0;
        }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          transition: 0.3s;
        }
        a:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✅ Payment Successful!</h1>
        <p>Thank you for your payment. Your order is now being processed.</p>
        <p style="color: #28a745; font-weight: bold;">✅ Payment Confirmed by Server</p>
        <a href="https://basket-ecommerce-iota.vercel.app/">Go to Home</a>
      </div>
    </body>
  </html>
`);
});

router.get("/cancel", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Cancelled</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #fff5f5, #ffffff);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .card {
            background: white;
            padding: 40px 60px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            animation: fadeIn 0.8s ease;
          }
          h1 {
            color: #dc3545;
            margin-bottom: 10px;
          }
          p {
            color: #555;
            margin: 8px 0;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            transition: 0.3s;
          }
          a:hover {
            background: #0056b3;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>❌ Payment Cancelled</h1>
          <p>You have cancelled the payment process. You can try again.</p>
        <a href="https://basket-ecommerce-iota.vercel.app/">Go to Home</a>
        </div>
      </body>
    </html>
  `);
});

router.get("/status", checkPaymentStatus);

export default router;
