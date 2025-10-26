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
import StripeWebhook from './routes/stripeWebhook.js'

dotenv.config({ path: ".env" });
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "SECRET", resave: false, saveUninitialized: true }));
app.use(helmet());
app.use(hpp());
app.use(cors());
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
app.use("/api/v1/payment",StripeWebhook );



app.use(notfound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://e-commarce-website-eight.vercel.app
