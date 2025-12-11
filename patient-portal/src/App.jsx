import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import BrowseDoctors from './pages/BrowseDoctors'
import DoctorDetails from './pages/DoctorDetails'
import BookAppointment from './pages/BookAppointment'
import Appointments from './pages/Appointments'
import AppointmentDetails from './pages/AppointmentDetails'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import BookingConfirmation from './pages/BookingConfirmation'
import PublicDoctors from './pages/PublicDoctors'
import Layout from './components/shared/Layout'
import PrivateRoute from './components/shared/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctors" element={<PublicDoctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors" element={<BrowseDoctors />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
            <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
            <Route path="booking-confirmation" element={<BookingConfirmation />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/:id" element={<AppointmentDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App
