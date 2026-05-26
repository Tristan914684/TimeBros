import { Routes, Route } from 'react-router-dom'
import First_page from './First_page'
import Sign_up_page from './Sign_up_page'
import Forgot_password_page from './Forgot_password_page'
import Timetable_page from './timetable_page'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<First_page />} />
      <Route path="/signup" element={<Sign_up_page />} />
      <Route path="/forgot-password" element={<Forgot_password_page />} />
      <Route path="/timetable" element={<Timetable_page />} />
    </Routes>
  )
}