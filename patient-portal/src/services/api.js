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
    // Only redirect to login for protected endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      // Don't redirect for public endpoints
      const publicEndpoints = ['/doctors/', '/doctors/specialties/', '/auth/login/', '/auth/register/']
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint))

      if (!isPublicEndpoint) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        // Only redirect if we're not already on a public page
        if (!window.location.pathname.match(/^\/(login|register|doctors|$)/)) {
          window.location.href = '/login'
        }
      }
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
    const response = await api.post('/auth/register/', userData)
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

export const patientService = {
  getProfile: async () => {
    const response = await api.get('/patients/profile/')
    return response.data
  },
  updateProfile: async (data) => {
    const response = await api.put('/patients/update_profile/', data)
    return response.data
  },
  getAppointments: async (params = {}) => {
    const response = await api.get('/patients/appointments/', { params })
    return response.data
  },
  bookAppointment: async (data) => {
    const response = await api.post('/appointments/', data)
    return response.data
  },
  cancelAppointment: async (id, reason = '') => {
    const response = await api.post(`/appointments/${id}/cancel/`, { reason })
    return response.data
  },
  getDoctors: async (params = {}) => {
    const response = await api.get('/doctors/', { params })
    return response.data
  },
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}/`)
    return response.data
  },
  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/available_slots/`, { params: { date } })
    return response.data
  },
}

export const doctorService = {
  list: async (params = {}) => {
    const response = await api.get('/doctors/', { params })
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/doctors/${id}/`)
    return response.data
  },
  getAvailableSlots: async (id, date) => {
    const response = await api.get(`/doctors/${id}/available_slots/`, { params: { date } })
    return response.data
  },
  getSpecialties: async () => {
    const response = await api.get('/doctors/specialties/')
    return response.data
  },
}

export const appointmentService = {
  list: async (params = {}) => {
    const response = await api.get('/appointments/', { params })
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/appointments/', data)
    return response.data
  },
  cancel: async (id, reason = '') => {
    const response = await api.post(`/appointments/${id}/cancel/`, { reason })
    return response.data
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/update_status/`, { status })
    return response.data
  },
  upcoming: async () => {
    const response = await api.get('/appointments/upcoming/')
    return response.data
  },
  past: async () => {
    const response = await api.get('/appointments/past/')
    return response.data
  },
}

export default api
