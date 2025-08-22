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

// ========================
// Middleware
// ========================
const allowedOrigins = [process.env.CLIENT_URL]; // تأكد من وضع رابط الفرونت إند هنا
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ========================
// HTTP server
// ========================
const server = http.createServer(app);

// ========================
// Socket.IO Setup
// ========================
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
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
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    connectToDB();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default server;
