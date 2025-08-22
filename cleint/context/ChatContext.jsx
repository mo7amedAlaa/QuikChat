import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios: authAxios, token, loadingAuth } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // جلب المستخدمين
  const getUsersForSidebar = async () => {
    if (!token || loadingAuth) return; // <-- استنى لما auth يخلص
    setLoadingUsers(true);
    try {
      const { data } = await authAxios.get("/api/messages/users");
      setUsers(data.users);
      setUnseenMessages(data.unseenMessages || {});
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error fetching users";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoadingUsers(false);
    }
  };

  // جلب الرسائل
  const getMessages = async (userId) => {
    if (!userId || loadingAuth) return; // <-- برضه هنا
    setLoadingMessages(true);
    try {
      const { data } = await authAxios.get(`/api/messages/${userId}`);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error fetching messages";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoadingMessages(false);
    }
  };

  // إرسال رسالة
  const sendMessage = async (messageData) => {
    if (!selectedUser || loadingAuth) {
      toast.error("Please select a user first");
      return;
    }
    try {
      const { data } = await authAxios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending message");
    }
  };

  // استقبال الرسائل من socket
  const subscribeToMessages = () => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && selectedUser._id === newMessage.senderId) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        authAxios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  };

  useEffect(() => {
    if (!loadingAuth) {
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [selectedUser, socket, loadingAuth]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsersForSidebar,
        getMessages,
        sendMessage,
        loadingUsers,
        loadingMessages,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
