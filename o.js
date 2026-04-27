


// CREATE TABLE users (
//     id BIGSERIAL PRIMARY KEY,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     username VARCHAR(50) UNIQUE,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     is_active BOOLEAN DEFAULT TRUE
// );

// CREATE TABLE tasks (
//     id BIGSERIAL PRIMARY KEY,
//     user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     title VARCHAR(255) NOT NULL,
//     description TEXT,
//     status VARCHAR(20) DEFAULT 'pending',
//     priority VARCHAR(20) DEFAULT 'medium',
//     due_date TIMESTAMP,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE audit_logs (
//     id BIGSERIAL PRIMARY KEY,
//     user_id BIGINT REFERENCES users(id),
//     task_id BIGINT REFERENCES tasks(id),
//     action VARCHAR(100) NOT NULL,
//     ip_address VARCHAR(45),
//     user_agent TEXT,
//     details JSONB,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// -- Indexes لتحسين الأداء
// CREATE INDEX idx_tasks_user_id ON tasks(user_id);
// CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
// CREATE INDEX idx_audit_logs_action ON audit_logs(action);






// =======================================



// middleware/sanitization.js
// import { sanitizeBody } from "express-validator";
import expressValidator from "express-validator";
const { sanitizeBody } = expressValidator;

// middleware لتنظيف كل الـ req.body
export const globalSanitizer = (req, res, next) => {
  // loop على كل الحقول في body ونظفها
  for (const key in req.body) {
    if (typeof req.body[key] === "string") {
      // trim: يشيل الفراغات، escape: يحول أي HTML/JS لكود آمن
      req.body[key] = req.body[key].trim().replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&#39;";
          case '"': return "&quot;";
          default: return c;
        }
      });
    }
  }
  next();
};








// 3️⃣ مثال عملي
// Request من Postman:
// {
//   "title": "<script>alert('hacked')</script>",
//   "description": "   Test task    "
// }

// بعد مرور الـ Middleware:
// {
//   "title": "&lt;script&gt;alert(&#39;hacked&#39;)&lt;/script&gt;",
//   "description": "Test task"
// }


// ✅ ده بيحميك من XSS وHTML Injection على مستوى كل الـ API.













import express from "express";
// import session from "express-session";
import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { notfound, errorHandler } from "./middleware/error.js";
// كل $ و . في الـ request body، query، أو params هتتشال تلقائيًا
import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
import statusMonitor from "express-status-monitor";
import { globalSanitizer } from "./middleware/sanitization.js";
dotenv.config({ path: ".env" });
connectDB();

const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "public")));
// app.use(session({ secret: "SECRET", resave: false, saveUninitialized: true }));
app.use(helmet());
app.use(hpp());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://e-commarce-website-eight.vercel.app",
    ],

    credentials: true, // عشان الكوكيز تتبعت
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(morgan());
// app.use(cookieParser());
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});
// app.use(xss());
app.use(statusMonitor());

// );
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: process.env.NODE_ENV === "production", // https
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://e-commarce-website-eight.vercel.app











// 2️⃣ استبدال xss-clean بمكتبة أخرى

// مثل express-mongo-sanitize
//  أو helmet لأنهم أكثر توافقًا مع Express >= 5 و Node >= 18.

// مثال:











































