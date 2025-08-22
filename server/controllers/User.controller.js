import User from "../models/User.model.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper: إنشاء JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper: تنظيف بيانات المستخدم (علشان متبعتش الباسورد أو حاجات حساسة بالغلط)
const sanitizeUser = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  profilePic: user.profilePic,
  createdAt: user.createdAt,
});

// ------------sign up------------------
export async function signUp(req, res) {
  try {
    const { email, password, fullName, bio } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email,
      password: passwordHash,
      fullName,
      bio,
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      userData: sanitizeUser(newUser),
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("SignUp Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ------------sign in------------------
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      userData: sanitizeUser(user),
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ----------check auth----------------
export async function checkAuth(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      userData: sanitizeUser(user),
    });
  } catch (error) {
    console.error("CheckAuth Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ----------update profile----------------
export async function updateUserProfile(req, res) {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let updatedData = {};
    if (fullName) updatedData.fullName = fullName;
    if (bio) updatedData.bio = bio;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
      });
      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      userData: sanitizeUser(updatedUser),
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
