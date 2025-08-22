import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useMemo } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";

const UserItem = ({ user, isOnline, unseenCount, selectedUser, setSelectedUser, setUnseenMessages }) => (
  <div
    key={user._id}
    className={`flex items-center gap-2 p-2 pl-4 rounded cursor-pointer relative transition-colors duration-200 ${
      selectedUser?._id === user._id ? "bg-[#282142]" : "hover:bg-[#282142]/60"
    }`}
    onClick={() => {
      setSelectedUser(user);
      setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
    }}
  >
    <img
      src={user?.profilePic || assets.avatar_icon}
      alt={user.fullName}
      className="w-[35px] h-[35px] rounded-full object-cover"
    />
    <div className="flex flex-col leading-5">
      <p className="text-sm font-medium text-white">{user.fullName}</p>
      <p className={`text-xs ${isOnline ? "text-green-400" : "text-neutral-400"}`}>
        {isOnline ? "online" : "offline"}
      </p>
    </div>

    {unseenCount > 0 && (
      <span className="absolute top-3 right-3 text-xs h-5 w-5 bg-violet-500/70 rounded-full flex justify-center items-center text-white font-semibold">
        {unseenCount}
      </span>
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const {
    getUsersForSidebar,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    loadingUsers,
    error,
  } = useContext(ChatContext);

  const { onlineUsers, logout } = useContext(AuthContext);
  const [input, setInput] = useState("");

  // جلب المستخدمين عند التحميل + متابعة التحديث عند تغير onlineUsers
  useEffect(() => {
    getUsersForSidebar();
  }, [onlineUsers]);

  // استخدام useMemo عشان التصفية تكون أسرع
  const filteredUsers = useMemo(() => {
    return input
      ? users.filter((user) =>
          user.fullName.toLowerCase().includes(input.toLowerCase())
        )
      : users;
  }, [users, input]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu */}
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="menu" className="cursor-pointer max-h-5" />
            <div className="absolute top-full right-0 p-3 z-20 w-36 rounded-md bg-[#282142] border text-gray-100 border-gray-600 hidden group-hover:block shadow-lg">
              <p
                onClick={() => navigate("/profile")}
                className="text-sm cursor-pointer hover:text-violet-400"
              >
                Edit profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                className="text-sm cursor-pointer hover:text-red-400"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex bg-[#282142] rounded-full items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search_icon" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search User..."
            className="bg-transparent outline-none text-white border-none text-xs placeholder-[#c8c8c8] flex-1"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex flex-col gap-2">
        {loadingUsers && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 pl-4 rounded bg-[#282142]/40 animate-pulse"
              >
                <div className="w-[35px] h-[35px] rounded-full bg-gray-600" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="w-24 h-3 bg-gray-600 rounded" />
                  <div className="w-16 h-2 bg-gray-600 rounded" />
                </div>
              </div>
            ))}
          </>
        )}

        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        {!loadingUsers && filteredUsers.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No users found</p>
        )}

        {!loadingUsers &&
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id.toString());
            const unseenCount = unseenMessages[user._id] || 0;

            return (
              <UserItem
                key={user._id}
                user={user}
                isOnline={isOnline}
                unseenCount={unseenCount}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                setUnseenMessages={setUnseenMessages}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
