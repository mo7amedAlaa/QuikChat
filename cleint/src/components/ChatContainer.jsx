import { useContext, useEffect, useRef, useState } from "react"
import assets from "../assets/assets"
import { FormatMessageTime } from "../lib/utils"
import { ChatContext } from "../../context/ChatContext"
import { AuthContext } from "../../context/AuthContext"

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    loading,
    error,
  } = useContext(ChatContext)

  const { onlineUsers, authUser } = useContext(AuthContext)

  const [input, setInput] = useState("")
  const scrollEnd = useRef()

  // ---- Send message ----
  const handleSendMessage = async (e) => {
    e?.preventDefault?.() // ✅ يمنع الكراش لو onClick مش مرر event
    if (!input?.trim() || !selectedUser) return
    try {
      await sendMessage({ text: input })
      setInput("")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  // ---- Send image ----
  const handleImageUpload = async (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result })
      } catch (err) {
        console.error("Error sending image:", err)
      }
      e.target.value = null
    }
  }

  // ---- Fetch messages when user changes ----
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  // ---- Auto scroll ----
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // ----------------- UI -----------------
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="logo" className="max-w-16" />
        <p className="text-lg font-medium text-white capitalize">
          Chat any time, anywhere
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading messages...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p>⚠️ Failed to load messages</p>
        <p className="text-xs opacity-70">{error}</p>
      </div>
    )
  }

  const safeMessages = Array.isArray(messages) ? messages : []

  return (
    <div className="h-full backdrop-blur-lg overflow-scroll relative">
      {/* ------Header-------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.profile_martin}
          alt="avatar"
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-white text-lg flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(false)}
          src={assets.arrow_icon}
          alt="close"
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="help" className="max-md:hidden max-w-5" />
      </div>

      {/* ------Chat area-------- */}
      <div className="flex flex-col p-3 pb-6 overflow-y-scroll h-[calc(100%-120px)]">
        {safeMessages.length > 0 ? (
          safeMessages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end justify-end ${
                message.senderId !== authUser._id && "flex-row-reverse"
              }`}
            >
              {message.image ? (
                <img
                  src={message.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light break-all bg-violet-500/30 text-white border rounded-lg mb-8 ${
                    message.senderId !== authUser._id
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div className="text-center text-xs">
                <img
                  src={
                    message.senderId === authUser._id
                      ? assets.avatar_icon
                      : assets.profile_martin
                  }
                  className="w-7 rounded-full"
                  alt=""
                />
                <p className="text-gray-400">
                  {FormatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center my-auto">
            No messages yet. Say hi 👋
          </p>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* ------Bottom area-------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center px-3 rounded-full bg-gray-100/15">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Send a Message"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(e)
            }}
            className="bg-transparent outline-none border-none text-white text-sm p-3 rounded-lg placeholder-gray-400 flex-1"
          />

          <input
            onChange={handleImageUpload}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  )
}

export default ChatContainer
