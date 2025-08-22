import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from '../context/AuthContext.jsx'
import { ChatProvider } from '../context/ChatContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter> 
   <AuthProvider>
    <ChatProvider>
    <App />
    </ChatProvider>
   </AuthProvider>
   </BrowserRouter>
  </StrictMode>,
)
