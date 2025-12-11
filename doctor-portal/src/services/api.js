import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  setToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    return response.data
  },
  register: async (userData) => {
    const response = await api.post('/auth/register/doctor/', userData)
    return response.data
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh')
    if (refresh) {
      try {
        await api.post('/auth/logout/', { refresh })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me/')
    return response.data
  },
}

export const doctorService = {
  getSpecialties: async () => {
    const response = await api.get('/doctors/specialties/')
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/doctors/profile/')
    return response.data
  },
  updateProfile: async (data) => {
    const response = await api.put('/doctors/update_profile/', data)
    return response.data
  },
  getAppointments: async (params = {}) => {
    const response = await api.get('/doctors/appointments/', { params })
    return response.data
  },
  updateSchedule: async (data) => {
    const response = await api.post('/doctors/schedule/', data)
    return response.data
  },
  getSchedule: async () => {
    const response = await api.get('/doctors/schedule/')
    return response.data
  },
}

export const appointmentService = {
  updateStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/update_status/`, { status })
    return response.data
  },
}

export default api

