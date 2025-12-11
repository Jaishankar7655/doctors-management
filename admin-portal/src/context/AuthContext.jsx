import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchUser()
    else setLoading(false)
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me/')
      const userData = response.data
      // Only allow admin users
      if (userData.user_type !== 'admin') {
        logout()
        window.location.href = '/login'
        return
      }
      setUser(userData)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    const userData = response.data.user
    
    // Check if user is admin
    if (userData.user_type !== 'admin') {
      throw new Error('Access denied. Admin credentials required.')
    }
    
    localStorage.setItem('token', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)
    setUser(userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user && user.user_type === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
