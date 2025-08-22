// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. استخراج التوكن من الهيدر
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.headers.token || null;

    // 2. التأكد من وجود التوكن
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // 3. التحقق من صحة التوكن
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Unauthorized: Token expired"
            : "Unauthorized: Invalid token",
      });
    }

    // 4. جلب المستخدم من قاعدة البيانات (من غير الباسورد)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. تخزين بيانات المستخدم داخل req لتمريرها للـ routes
    req.user = user;

    // 6. المتابعة للـ route اللي بعده
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
    });
  }
};
