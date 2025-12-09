import { BrowserRouter, Route, Routes } from "react-router-dom"

import { GlobalStyle } from "./style"

import Home from "./pages/Home"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile"
import NewPost from "./pages/NewPost"
import EditProfile from "./pages/EditProfile"
import AuthProvider from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/:username" element={<Profile />} />
            <Route path="/new-post" element={<NewPost />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
