import { useEffect, useState } from 'react'
import { doctorService, appointmentService } from '../services/api'
import toast from 'react-hot-toast'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const data = await doctorService.getAppointments()
      setAppointments(data.results || data)
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status)
      toast.success('Status updated')
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{appointment.patient.user.full_name}</h3>
                <p className="text-sm text-gray-600">{appointment.appointment_date} at {appointment.appointment_time}</p>
                {appointment.symptoms && <p className="mt-2 text-sm">{appointment.symptoms}</p>}
              </div>
              <div className="flex flex-col space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs ${appointment.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {appointment.status}
                </span>
                {appointment.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleStatusUpdate(appointment.id, 'confirmed')} className="btn-primary text-sm">
                      Accept
                    </button>
                    <button onClick={() => handleStatusUpdate(appointment.id, 'cancelled')} className="btn-outline text-sm">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Appointments

