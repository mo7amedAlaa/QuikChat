import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { authUser, updateProfile } = useContext(AuthContext)
  const [Name, setName] = useState(authUser.fullName)
  const [bio, setBio] = useState(authUser.bio)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!selectedImage) {
      await updateProfile({ fullName: Name, bio })
      setLoading(false)
      navigate('/profile')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImage)
    reader.onloadend = async () => {
      await updateProfile({ fullName: Name, bio, profilePic: reader.result })
      setLoading(false)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4">
      <div className="w-full max-w-2xl backdrop-blur-3xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-xl shadow-xl transition-all duration-500 hover:scale-[1.02]">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h1 className="text-2xl capitalize font-bold text-white animate-pulse">Profile Details</h1>

          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer transition-transform duration-300 hover:scale-105">
            <input 
              type="file" 
              name="avatar" 
              id="avatar" 
              accept="image/*" 
              onChange={(e) => setSelectedImage(e.target.files[0])} 
              hidden 
            />
            <img 
              src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} 
              alt="avatar" 
              className={`w-16 h-16 transition-all duration-500 ${selectedImage && "rounded-full shadow-lg"}`} 
            />
            <span className="text-gray-400 hover:text-white transition-colors">Upload profile picture</span>
          </label>

          <input 
            type="text" 
            placeholder="Your Name" 
            className="placeholder:capitalize bg-transparent p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300" 
            value={Name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />

          <textarea 
            placeholder="Write profile bio" 
            className="bg-transparent p-2 border border-gray-500 rounded-md placeholder:capitalize focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300" 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            required
          />

          <button 
            type="submit" 
            className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 flex items-center justify-center gap-2`}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            ) : (
              'Save'
            )}
          </button>
        </form>

        <img 
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 transition-transform duration-500 hover:scale-105 shadow-xl" 
          src={authUser.profilePic || assets.logo_icon} 
          alt="Profile" 
        />
      </div>
    </div>
  )
}

export default ProfilePage
