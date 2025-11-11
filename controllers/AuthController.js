import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/users.js";
import { sendEmail } from "../utils/emailServices.js";
import rateLimit from "express-rate-limit";
import "../config/passport.js";

const generateTokens = (user) => {
  const AccessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    // 7d   15m
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { AccessToken, refreshToken };
};
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("RefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const RegisterUser = asyncHandler(async (req, res) => {
  const { Name, Email, Password, Phone, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ Phone }, { Email }] });
  if (existingUser) {
    return res.status(403).json({ message: "Phone or Email already in use" });
  }
  const hashedPassword = await bcrypt.hash(Password, 10);

  const user = await User.create({
    Name,
    Email,
    Phone,
    Password: hashedPassword,
    role: role || "Customer",
  });
  const { AccessToken, refreshToken } = generateTokens(user);
  setRefreshCookie(res, refreshToken);

  await sendEmail({
    to: user.Email,
    subject: "Welcome to Our E-commerce Store 🛒",
    text: `Hello ${user.Name}, your account has been created successfully! Start shopping now!`,
    html: `
    <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px; text-align:center;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color:#2c3e50;">Welcome, ${user.Name} 👋</h2>
        <p style="font-size:16px; color:#555;">
          We're thrilled to have you at <strong style="color:#e67e22;">E-commerce Store</strong>!
        </p>
        <p style="font-size:15px; color:#333; line-height:1.6;">
          Your account is ready. Start exploring our products and enjoy a seamless shopping experience.
          <br><br>
          <a href="https://your-ecommerce-site.com/login" 
             style="display:inline-block; padding:12px 24px; margin-top:15px; background:#e67e22; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
            Go to Dashboard
          </a>
        </p>
        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
        <p style="font-size:13px; color:#999;">
          © ${new Date().getFullYear()} E-commerce Store. All rights reserved.
        </p>
      </div>
    </div>
  `,
  });


  
  // 🚀 Queue welcome email (NON-BLOCKING!)
  try {
    await sendEmailToQueue(
      {
        to: user.Email,
        subject: "Welcome to Our E-commerce Store 🛒",
        text: `Hello ${user.Name}, your account has been created successfully! Start shopping now!`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px; text-align:center;">
            <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
              <h2 style="color:#2c3e50;">Welcome, ${user.Name} 👋</h2>
              <p style="font-size:16px; color:#555;">
                We're thrilled to have you at <strong style="color:#e67e22;">E-commerce Store</strong>!
              </p>
              <p style="font-size:15px; color:#333; line-height:1.6;">
                Your account is ready. Start exploring our products and enjoy a seamless shopping experience.
                <br><br>
                <a href="https://your-ecommerce-site.com/login" 
                   style="display:inline-block; padding:12px 24px; margin-top:15px; background:#e67e22; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
                  Go to Dashboard
                </a>
              </p>
              <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
              <p style="font-size:13px; color:#999;">
                © ${new Date().getFullYear()} E-commerce Store. All rights reserved.
              </p>
            </div>
          </div>
        `,
      },
      8 // High priority (0-10, where 10 is highest)
    );
  } catch (error) {
    // Don't fail registration if email queuing fails
    console.error('⚠️ Failed to queue welcome email:', error.message);
  }

  res.status(201).json({
    message: "Registration successful.",
    user: {
      id: user._id,
      Name: user.Name,
      Email: user.Email,
      Phone: user.Phone,
      role: user.role,
    },
    AccessToken,
    refreshToken,
  });
});
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { Phone, Password } = req.body;

  const user = await User.findOne({ Phone });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid phone number or password" });
  }
  const isMatch = await bcrypt.compare(Password, user.Password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ message: "Invalid phone number or password" });
  }

  const { AccessToken, refreshToken } = generateTokens(user);
  setRefreshCookie(res, refreshToken);

  // await sendEmail({
  //   to: user.Email,
  //   subject: "Welcome Back to Our Store 🛒",
  //   text: `Hello ${user.Name}, you have logged in successfully! Start shopping now!`,
  //   html: `
  //   <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px; text-align:center;">
  //     <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
  //       <h2 style="color:#2c3e50;">Welcome Back, ${user.Name} 👋</h2>
  //       <p style="font-size:16px; color:#555;">
  //         We're thrilled to see you again at <strong style="color:#e67e22;">Our Store</strong>!
  //       </p>
  //       <p style="font-size:15px; color:#333; line-height:1.6;">
  //         Continue exploring our products and enjoy an effortless shopping experience.
  //         <br><br>
  //         <a href="https://your-ecommerce-site.com/dashboard" 
  //            style="display:inline-block; padding:12px 24px; margin-top:15px; background:#e67e22; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
  //           Go to Dashboard
  //         </a>
  //       </p>
  //       <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
  //       <p style="font-size:13px; color:#999;">
  //         © ${new Date().getFullYear()} Our Store. All rights reserved.
  //       </p>
  //     </div>
  //   </div>
  // `,
  // });

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      Name: user.Name,
      Phone: user.Phone,
      Email: user.Email,
      role: user.role,
    },
    AccessToken,
    refreshToken,
  });
});
// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("AccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("RefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});
// @desc    Update Profile
// @route   POST /api/v1/auth/update
// @access  Public
export const UpdateProfile = asyncHandler(async (req, res) => {
  const { Name, Phone, Email } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const existingUser = await User.findOne({ Phone });
  if (existingUser && existingUser._id.toString() !== id) {
    return res.status(403).json({ message: "Phone number already in use" });
  }
  user.Name = Name;
  user.Phone = Phone;
  user.Email = Email;

  await user.save();

  await sendEmail({
    to: user.Email,
    subject: "Your Profile Has Been Updated ✅",
    text: `Hello ${user.Name}, your profile information has been updated successfully!`,
    html: `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px; text-align:center;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color:#2c3e50;">Hello ${user.Name} 👋</h2>
      <p style="font-size:16px; color:#555;">
        We're writing to let you know that your profile information has been updated successfully.
      </p>
      <p style="font-size:15px; color:#333; line-height:1.6;">
        Here’s a summary of your current information:
        <br><br>
        <strong>Name:</strong> ${user.Name} <br>
        <strong>Email:</strong> ${user.Email} <br>
        <strong>Phone:</strong> ${user.Phone} <br><br>
        If you did not make these changes, please contact our support immediately.
      </p>
      <a href="https://your-ecommerce-site.com/dashboard" 
         style="display:inline-block; padding:12px 24px; margin-top:15px; background:#e67e22; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
        Go to Dashboard
      </a>
      <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
      <p style="font-size:13px; color:#999;">
        © ${new Date().getFullYear()} Our Store. All rights reserved.
      </p>
    </div>
  </div>
  `,
  });

  res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      Name: user.Name,
      Email: user.Email,
      Phone: user.Phone,
      role: user.role,
    },
  });
});
// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const RefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.RefreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { AccessToken } = generateTokens(user);

    res.cookie("AccessToken", AccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 دقيقة
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      AccessToken,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
});

// @desc    Google callback
// محتاج : CLIENT_URL بتاع الفرونت
export const googleCallbackController = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Login failed" });
  }
  const { AccessToken, refreshToken } = generateTokens(user);
  setRefreshCookie(res, refreshToken);
  return res.redirect(
    `${process.env.CLIENT_URL}/login/success?access=${AccessToken}&refresh=${refreshToken}`
  );
};

// @desc    limit of login to avoid Brute-force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const CountUser = asyncHandler(async (req, res) => {
  const count_user = await User.countDocuments();
  if (!count_user) {
    return res.status(404).json({ message: "not exist any user" });
  }

  res.status(200).json({
    success: true,
    count: count_user,
  });
});

// Get all users(admin)
export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-Password");
  if (!users) {
    return res.status(404).json({ message: "not exist any user" });
  }
  res.status(200).json({
    success: true,
    users,
  });
});
// admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const newUserData = {
    Name: req.body.Name,
    Email: req.body.Email,
    role: req.body.role,
  };

  const UpdateUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    UpdateUser,
  });
});
