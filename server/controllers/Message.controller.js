import User from "../models/User.model.js";
import Message from "../models/Message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { sendToUser } from "../server.js"; // استخدمنا الفانكشن المخصصة

// =========================================
// Get all users for sidebar (except myself)
// =========================================
export async function getUsersForSidebar(req, res) {
  try {
    const userId = req.user._id;

    // 1. جلب كل المستخدمين باستثناء الحالي
    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    // 2. حساب عدد الرسائل غير المقروءة لكل مستخدم
    const unseenMessagesArray = await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        return { userId: user._id, count };
      })
    );

    // 3. تحويل النتيجة إلى object { userId: count }
    const unseenMessages = unseenMessagesArray.reduce((acc, item) => {
      if (item.count > 0) acc[item.userId] = item.count;
      return acc;
    }, {});

    // 4. إرسال الاستجابة
    res.json({
      success: true,
      users,
      unseenMessages,
    });
  } catch (error) {
    console.error("getUsersForSidebar error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// =========================================
// Get all messages between logged-in user and selected user
// =========================================
export async function getMessages(req, res) {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    // Find all messages where sender/receiver are either me or the selected user
    const messages = await Message.find({
      $or: [
        { senderId: selectedUserId, receiverId: myId },
        { senderId: myId, receiverId: selectedUserId },
      ],
    }).sort({ createdAt: 1 }); // ترتيب الرسائل بالزمن

    // Mark messages from selected user as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =========================================
// Mark a single message as seen by message ID
// =========================================
export async function markMessageAsSeen(req, res) {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =========================================
// Send a new message
// =========================================
export async function sendMessage(req, res) {
  try {
    const { text, image } = req.body;

    const senderId = req.user._id;
    const receiverId = req.params.id;
    let imageUrl;

    // لو في صورة هترفعها على cloudinary
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    // إنشاء الرسالة
    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // 🔥 إرسال الرسالة مباشرة للمستقبل لو Online
    sendToUser(receiverId, "newMessage", message);

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
