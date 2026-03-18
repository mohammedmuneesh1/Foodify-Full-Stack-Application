import { Route, Routes } from 'react-router-dom'
import './App.css'
import SignupPage from './pages/SignupPage'
import SignInPage from './pages/SignInPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

function App() {
  return (
    <>
  <Routes>
    <Route path="/signup" element={<SignupPage/>}/>
    <Route path="/signin" element={<SignInPage/>}/>
    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
  </Routes>
    </>
  )
}

export default App
