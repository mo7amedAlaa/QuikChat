import { useContext, useMemo } from "react";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages, loading, error } = useContext(ChatContext);
  const { onlineUsers, logout } = useContext(AuthContext);

  // ✅ safe check: لو الرسائل مش Array رجع Array فاضية
  const safeMessages = Array.isArray(messages) ? messages : [];

  // ✅ جهز الصور مرة واحدة باستخدام useMemo
  const msgImages = useMemo(
    () => safeMessages.filter((msg) => msg.image).map((msg) => msg.image),
    [safeMessages]
  );

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading chat data...
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p>⚠️ Failed to load data</p>
        <p className="text-xs opacity-70">{error}</p>
      </div>
    );
  }

  // --- Empty Chat State ---
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a user to see profile and media
      </div>
    );
  }

  return (
    <div
      className={`bg-[#8185B2]/10 h-full relative w-full overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* --- Profile Info --- */}
      <div className="pt-16 flex flex-col items-center gap-2 text-sm font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="text-xl px-10 font-medium mx-auto flex items-center gap-2">
          {onlineUsers?.includes?.(selectedUser?._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
          {selectedUser?.fullName}
        </h1>
        {selectedUser?.bio && (
          <p className="mx-auto px-10 text-gray-300">{selectedUser.bio}</p>
        )}
      </div>

      <hr className="my-4 border-[#ffffff50]" />

      {/* --- Media Section --- */}
      <div className="text-sm px-5">
        <p className="font-medium">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="rounded cursor-pointer"
              >
                <img
                  src={url}
                  alt={`media-${index}`}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs">No media shared yet</p>
          )}
        </div>
      </div>

      {/* --- Logout Button --- */}
      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white font-light text-sm py-2 px-20 rounded-full cursor-pointer capitalize shadow-md hover:opacity-90"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
