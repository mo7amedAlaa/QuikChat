import { useContext, useState } from "react"
import assets from "../assets/assets"
import { AuthContext } from "../../context/AuthContext"
const LoginPage = () => {
  const [currentState, setCurrentState] = useState('Sign Up')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)
  const { login } = useContext(AuthContext)
  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (currentState === 'Sign Up' && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }
    login(currentState==='Sign Up'?'signUp':'login',{email,password,fullName,bio})

  }
  return (
    <div className="min-h-screen bg-cover bg-center  flex items-center justify-center gap-8 sm:justify-evenly  max-sm:flex-col backdrop-blur-2xl ">
      {/*------------------ Left area----------------- */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />

      {/*------------------ Right area----------------- */}
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg ">
        <h1 className="text-2xl font-medium flex items-center justify-between">
          {currentState}
          {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="arrow" className="w-5 cursor-pointer" />}
        </h1>
        {currentState === 'Sign Up' && !isDataSubmitted && (
          <input type="text" placeholder="Full Name" className=" bg-transparent p-2 border border-gray-600
          rounded-md focus:outline-none" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        )}
        {!isDataSubmitted && (
          <>
            <input type="email" placeholder="Email" className=" bg-transparent p-2 border border-gray-600
          rounded-md focus:outline-none focus:right-2  focus:ring-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <input type="password" placeholder="Password" className=" bg-transparent p-2 border border-gray-600
          rounded-md focus:outline-none focus:right-2  focus:ring-indigo-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        )}
        {currentState === 'Sign Up' && isDataSubmitted && (
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows="4" className=" bg-transparent p-2 border border-gray-600
          rounded-md focus:outline-none focus:right-2  focus:ring-indigo-500"  placeholder="provide a short bio" required></textarea>
        )}
        <button type="submit" className="bg-gradient-to-r from-purple-400 to-violet-600 text-white   rounded-md   text-sm py-3 px-20   cursor-pointer capitalize">
          {currentState === 'Sign Up' ? ' Sign Up' : 'Sign In'}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-50">
          <input type="checkbox" name="" id="" />
          <p>Agree to the terms of use and privacy policy</p>
        </div>
        <div className="flex flex-col-gap-8">
          {currentState === 'Sign Up' ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                className="font-medium  text-violet-500 cursor-pointer"
                onClick={() => { setCurrentState("Sign In"); setIsDataSubmitted(false) }}
              >
                Sign In
              </span>
            </p>

          ) : (
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                className="font-medium  text-violet-500 cursor-pointer"
                onClick={() => { setCurrentState("Sign Up"); setIsDataSubmitted(false) }}
              >
                Sign Up
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage
