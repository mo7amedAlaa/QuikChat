import express from "express";

import {
  sendMessage,
  markMessageAsSeen,
  getMessages,
  getUsersForSidebar,
} from "../controllers/Message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const messageRouter = express.Router();
messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessageAsSeen);

export default messageRouter;
