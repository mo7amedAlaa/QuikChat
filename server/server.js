import dotenv from "dotenv";
import express from "express";
import { connectToDB } from "./lib/db.js";
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/Message.route.js";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// ========================
// Middleware
// ========================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ========================
// Socket.IO Setup
// ========================
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ========================
// Online Users Tracking
// ========================
export const userSocketMap = new Map();

const addUserSocket = (userId, socketId) => {
  if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
  userSocketMap.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  if (!userSocketMap.has(userId)) return;
  const sockets = userSocketMap.get(userId);
  sockets.delete(socketId);
  if (sockets.size === 0) userSocketMap.delete(userId);
};

export const getOnlineUsers = () => Array.from(userSocketMap.keys());

export const sendToUser = (userId, event, payload) => {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return;
  sockets.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

// ========================
// Socket.IO Connection
// ========================
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.log("❌ Connection rejected: No userId");
    socket.disconnect();
    return;
  }

  console.log(`✅ User connected: ${userId}`);
  addUserSocket(userId, socket.id);

  // broadcast online users
  io.emit("getOnlineUsers", getOnlineUsers());

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${userId}`);
    removeUserSocket(userId, socket.id);
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

// ========================
// Routes
// ========================
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ========================
// Start Server
// ========================
server.listen(PORT, () => {
  connectToDB();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
