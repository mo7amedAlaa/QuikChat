// context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import io from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // التحقق من الجلسة
  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/auth/check-auth", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAuthUser(data.userData);
        localStorage.setItem("user", JSON.stringify(data.userData));
        connectSocket(data.userData);
        setError(null);
      } else {
        logout();
      }
    } catch (err) {
      console.error("checkAuth error:", err);
      const msg = err.response?.data?.message || "Authentication failed";
      setError(msg);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ربط socket
  const connectSocket = (userData) => {
    if (!userData) return;
     

    if (socket) socket.disconnect();
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);
  };

  // تسجيل الدخول
  const login = async (state, credentials) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userData));
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        connectSocket(data.userData);
        toast.success(data.message);
        setError(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = () => {
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logout successful");
  };

  // تحديث البروفايل
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.userData);
        localStorage.setItem("user", JSON.stringify(data.userData));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ضبط axios و التحقق من الجلسة عند تغيير التوكن
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        token,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        axios,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
