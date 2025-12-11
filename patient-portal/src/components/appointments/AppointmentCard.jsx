import { Link } from 'react-router-dom'

const AppointmentCard = ({ appointment, onCancel }) => {
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
            case 'no_show':
                return 'bg-gray-100 text-gray-800 border-gray-200'
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
            weekday: 'short',
            year: 'numeric',
            month: 'short',
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

    const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed'

    return (
        <div className="card hover:shadow-lg transition-shadow">
            {/* Header with Booking ID and Status */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">#{appointment.id}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                    <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                </span>
            </div>

            {/* Doctor Info */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Dr. {appointment.doctor.user.full_name}
                </h3>
                {appointment.doctor.specialization && appointment.doctor.specialization.length > 0 && (
                    <p className="text-sm text-primary-600 font-medium">
                        {appointment.doctor.specialization.map(s => s.name).join(', ')}
                    </p>
                )}
            </div>

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(appointment.appointment_time)}</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2 col-span-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-medium text-gray-900">
                            {appointment.appointment_type === 'online' ? '💻 Online Consultation' : '🏥 In-Person Visit'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Symptoms */}
            {appointment.symptoms && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Symptoms</p>
                    <p className="text-sm text-blue-800">{appointment.symptoms}</p>
                </div>
            )}

            {/* Cancellation Reason */}
            {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-semibold text-red-900 mb-1">Cancellation Reason</p>
                    <p className="text-sm text-red-800">{appointment.cancellation_reason}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-3 border-t border-gray-100">
                <Link
                    to={`/app/appointments/${appointment.id}`}
                    className="flex-1 text-center px-4 py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                >
                    View Details
                </Link>
                {canCancel && onCancel && (
                    <button
                        onClick={() => onCancel(appointment.id)}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        Cancel Appointment
                    </button>
                )}
            </div>
        </div>
    )
}

export default AppointmentCard
