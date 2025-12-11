import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { appointmentService } from '../services/api'
import toast from 'react-hot-toast'

const AppointmentDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAppointment()
    }, [id])

    const fetchAppointment = async () => {
        try {
            const data = await appointmentService.getById(id)
            setAppointment(data)
        } catch (error) {
            console.error('Failed to load appointment:', error)
            toast.error('Failed to load appointment details')
            navigate('/app/appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelAppointment = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return
        }

        const reason = window.prompt('Please provide a reason for cancellation (optional):')

        try {
            await appointmentService.cancel(id, reason || '')
            toast.success('Appointment cancelled successfully')
            navigate('/app/appointments')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel appointment')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return '✓'
            case 'pending':
                return '⏱'
            case 'completed':
                return '✓✓'
            case 'cancelled':
                return '✕'
            default:
                return '•'
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900">Appointment not found</h3>
                <Link to="/app/appointments" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                    ← Back to Appointments
                </Link>
            </div>
        )
    }

    const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/app/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">
                        ← Back to Appointments
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}>
                    <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                </span>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Booking Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Booking Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                                <p className="text-lg font-mono font-semibold text-gray-900">#{appointment.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Booked On</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(appointment.created_at).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Doctor Information
                        </h2>
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 flex-shrink-0">
                                {appointment.doctor.user.full_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    Dr. {appointment.doctor.user.full_name}
                                </h3>
                                {appointment.doctor.specialization && appointment.doctor.specialization.length > 0 && (
                                    <p className="text-primary-600 font-medium mb-2">
                                        {appointment.doctor.specialization.map(s => s.name).join(', ')}
                                    </p>
                                )}
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>📧 {appointment.doctor.user.email}</p>
                                    <p>💼 {appointment.doctor.experience_years} years experience</p>
                                    <p>💰 Consultation Fee: ₹{appointment.doctor.consultation_fee}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Appointment Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatTime(appointment.appointment_time)}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-gray-500">Consultation Type</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {appointment.appointment_type === 'online' ? '💻 Online Consultation' : '🏥 In-Person Visit'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms & Notes */}
                    {(appointment.symptoms || appointment.notes) && (
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                Medical Information
                            </h2>
                            {appointment.symptoms && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Symptoms</p>
                                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        {appointment.symptoms}
                                    </p>
                                </div>
                            )}
                            {appointment.notes && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Additional Notes</p>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {appointment.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                        <div className="card bg-red-50 border-red-200">
                            <h2 className="text-xl font-bold text-red-900 mb-4 pb-3 border-b border-red-200">
                                Cancellation Information
                            </h2>
                            <p className="text-red-800">{appointment.cancellation_reason}</p>
                            {appointment.cancelled_at && (
                                <p className="text-sm text-red-600 mt-2">
                                    Cancelled on: {new Date(appointment.cancelled_at).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Actions & Timeline */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            {canCancel && (
                                <button
                                    onClick={handleCancelAppointment}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Cancel Appointment
                                </button>
                            )}
                            <Link
                                to="/app/appointments"
                                className="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                View All Appointments
                            </Link>
                            <Link
                                to="/app/doctors"
                                className="block w-full text-center px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                            >
                                Book Another Appointment
                            </Link>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="card bg-primary-50 border-primary-200">
                        <h3 className="text-lg font-bold text-primary-900 mb-3">Need Help?</h3>
                        <p className="text-sm text-primary-800 mb-3">
                            If you have any questions about your appointment, please contact support.
                        </p>
                        <a
                            href="mailto:support@healthcare.com"
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                            📧 support@healthcare.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppointmentDetails
