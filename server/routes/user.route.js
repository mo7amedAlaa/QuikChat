import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
const userRouter = express.Router();
import {
  signUp,
  login,
  checkAuth,
  updateUserProfile,
} from "../controllers/User.controller.js";

userRouter.post("/signUp", signUp);
userRouter.post("/login", login);
userRouter.get("/check-auth", protectRoute, checkAuth);
userRouter.put("/update-profile", protectRoute, updateUserProfile);

export default userRouter;
