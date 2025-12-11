import { useEffect, useState } from 'react'
import { doctorService } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const appointments = await doctorService.getAppointments()
      const today = new Date().toISOString().split('T')[0]
      const todayApps = appointments.filter(a => a.appointment_date === today)
      const pending = appointments.filter(a => a.status === 'pending')
      setStats({
        todayAppointments: todayApps.length,
        pendingAppointments: pending.length,
        totalPatients: new Set(appointments.map(a => a.patient.id)).size,
      })
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Today's Appointments</p>
          <p className="text-2xl font-bold">{stats.todayAppointments}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Pending Appointments</p>
          <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Patients</p>
          <p className="text-2xl font-bold">{stats.totalPatients}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

