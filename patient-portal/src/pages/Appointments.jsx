import { useState, useEffect } from 'react'
import { appointmentService } from '../services/api'
import AppointmentCard from '../components/appointments/AppointmentCard'
import toast from 'react-hot-toast'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'confirmed', 'completed', 'cancelled'

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentService.list()
      setAppointments(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error('Failed to load appointments')
      console.error(error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    const reason = window.prompt('Please provide a reason for cancellation (optional):')

    try {
      await appointmentService.cancel(appointmentId, reason || '')
      toast.success('Appointment cancelled successfully')
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment')
    }
  }

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'all') return true
    return apt.status === activeTab
  })

  // Group appointments by status for counts
  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const tabs = [
    { id: 'all', label: 'All Appointments', count: statusCounts.all },
    { id: 'pending', label: 'Pending', count: statusCounts.pending, color: 'yellow' },
    { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed, color: 'green' },
    { id: 'completed', label: 'Completed', count: statusCounts.completed, color: 'blue' },
    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'red' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">View and manage all your medical appointments</p>
        </div>
      </div>

      {/* Enhanced Tabs with Counts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 card">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'all'
              ? "You haven't booked any appointments yet"
              : `No ${activeTab} appointments`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelAppointment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Appointments
