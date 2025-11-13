import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import passport from "./config/passport.js";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { notfound, errorHandler } from "./middlewares/error.js";
import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
import statusMonitor from "express-status-monitor";
import path from "path";
import { fileURLToPath } from "url";
import StripeWebhook from "./routes/stripeWebhook.js";

dotenv.config({ path: ".env" });
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "SECRET", resave: false, saveUninitialized: true }));
app.use(helmet());
app.use(hpp());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://e-commerce-website-eight.vercel.app",
      "https://e-commarce-website-eight.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true, // عشان الكوكيز تتبعت
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    
  })
);

app.use(morgan());
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});
// app.use(xss());
app.use(statusMonitor());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // https
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

import authRoutes from "./routes/AuthRoute.js";
import product from "./routes/ProductRoute.js";
import categoryRoutes from "./routes/CategoryRoute.js";
import orderRoutes from "./routes/OrderRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import offerRoutes from "./routes/OfferRoute.js";
import cartRoutes from "./routes/CartRoute.js";
import brandRoutes from "./routes/BrandRoute.js";
import blogRoutes from "./routes/BlogRoute.js";
import wishlistRoutes from "./routes/WishlistRoute.js";
import contactRoutes from "./routes/ContactRoute.js";

app.get("/", (req, res) => res.send("Hello in vercel"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", product);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/offer", offerRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/contact-us", contactRoutes);
app.use("/api/v1/brand", brandRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/payment", StripeWebhook);

app.use(notfound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://e-commarce-website-eight.vercel.app

// شرح السطر ده:
// origin: "https://e-commarce-website-eight.vercel.app"
// ده معناه إن السيرفر (الـ backend) يسمح فقط بطلبات جاية من الموقع ده (الـ frontend على Vercel).
// لو أي موقع تاني حاول يبعت request → المتصفح هيمنعه.

// credentials: true
// ده بيسمح إن الكوكيز أو التوكن أو أي بيانات حساسة تتبعت مع الطلب (زي الـ JWT أو الـ session cookie).
// وده ضروري لو عندك نظام تسجيل دخول أو توكن محفوظ في الكوكيز.

// ⚠️ مهم جدًا:
// لما تستخدم credentials: true لازم تتأكد إن الرد (response) فعلاً بيضيف الـ headers دي:
// Access-Control-Allow-Origin: https://e-commarce-website-eight.vercel.app
// Access-Control-Allow-Credentials: true

// المتصفح هو اللي بيتأكد من دول، لو واحد منهم ناقص → يرفض الرد.

// ✅ نصيحة إضافية:
// لو بتجرب من localhost كمان أثناء التطوير، تقدر تعمل كده:
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://e-commarce-website-eight.vercel.app"
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// ده بيخلي السيرفر يسمح بالـ requests سواء من Vercel أو localhost أثناء الـ development.

// تحب أشرحلك كمان إزاي تتأكد إن إعدادات الـ CORS اتطبقت فعلاً (يعني إزاي تختبرها من المتصفح أو Postman)؟
// You said:
// كده ؟؟؟رapp.use(cors({
//   origin: "http://localhost:5173","https://e-commarce-website-eight.vercel.app",
  
//   credentials: true
// }));