import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAppointments(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to load appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to approve this appointment?')) {
      return
    }

    setActionLoading(prev => ({ ...prev, [appointmentId]: true }))
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/approve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Appointment approved successfully')
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve appointment')
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  const handleReject = async (appointmentId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setActionLoading(prev => ({ ...prev, [appointmentId]: true }))
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/reject/`,
        { reason: reason || 'Rejected by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Appointment rejected')
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject appointment')
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.patient?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || styles.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all appointments</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredAppointments.length} appointments
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header px-6 py-3 text-left">Patient</th>
                <th className="table-header px-6 py-3 text-left">Doctor</th>
                <th className="table-header px-6 py-3 text-left">Date</th>
                <th className="table-header px-6 py-3 text-left">Time</th>
                <th className="table-header px-6 py-3 text-left">Type</th>
                <th className="table-header px-6 py-3 text-left">Status</th>
                <th className="table-header px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-cell text-center text-gray-500 py-8">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">
                      {appointment.patient?.user?.full_name || 'N/A'}
                    </td>
                    <td className="table-cell">
                      {appointment.doctor?.user?.full_name || 'N/A'}
                    </td>
                    <td className="table-cell text-gray-600">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-gray-600">
                      {appointment.appointment_time}
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-600 capitalize">
                        {appointment.appointment_type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {appointment.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(appointment.id)}
                            disabled={actionLoading[appointment.id]}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading[appointment.id] ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(appointment.id)}
                            disabled={actionLoading[appointment.id]}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading[appointment.id] ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Appointments
