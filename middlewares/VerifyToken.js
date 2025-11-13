import JWT from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const VerifyToken = asyncHandler(async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (authToken && authToken.startsWith("Bearer ")) {
    const token = authToken.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Token is missing after Bearer");
    }

    const decodedPayload = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decodedPayload;
    next();
  } else {
    res.status(401);
    throw new Error("You are not logged in to access this token");
  }
});

export const VerifyToken1 = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "You are not logged in to access this token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // مهم: req.user.id = decoded.id (مش _id)
    req.user = {
      id: decoded.id,   // نفس اللي في الـ token
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
});

export const VerifyTokenAdmin = asyncHandler(async (req, res, next) => {
  await VerifyToken(req, res, async () => {
    if (req.user && req.user.role === "Admin") {
      next();
    } else {
      res.status(403);
      throw new Error("Not allowed, only Admin");
    }
  });
});
