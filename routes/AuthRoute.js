import express from "express";
import passport from "passport";
import "../config/passport.js";

import {
  RegisterUser,
  loginUser,
  logoutUser,
  UpdateProfile,
  RefreshToken,
  googleCallbackController,
  loginLimiter,
  CountUser,
} from "../Controllers/AuthController.js";
import { validate } from "../middlewares/Validate.js";
import { UserValidate } from "../validation/UserValidation.js";

const router = express.Router();

router.get("/count", CountUser);
router.post("/register", validate(UserValidate), RegisterUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", RefreshToken);
router.put("/update-profile/:id", UpdateProfile);

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleCallbackController
);

// /google	يرسل المستخدم لموقع Google لتسجيل الدخول	البداية
// /google/callback	يستقبل المستخدم بعد موافقة Google ويعالج بياناته	النهاية

// /http://localhost:8000/api/v1/auth/google

export default router;
