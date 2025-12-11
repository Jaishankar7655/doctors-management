import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const BookingConfirmation = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const appointment = location.state?.appointment

    useEffect(() => {
        if (!appointment) {
            navigate('/app/appointments')
        }
    }, [appointment, navigate])

    if (!appointment) {
        return null
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

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Success Message */}
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                <p className="text-gray-600">Your appointment has been successfully booked</p>
            </div>

            {/* Booking ID Card */}
            <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Booking ID</p>
                    <p className="text-3xl font-bold text-primary-600 font-mono">#{appointment.id}</p>
                    <p className="text-xs text-gray-500 mt-2">Please save this ID for your records</p>
                </div>
            </div>

            {/* Appointment Details */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>

                <div className="space-y-6">
                    {/* Doctor Info */}
                    <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary-600">
                                {appointment.doctor.user.full_name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Doctor</p>
                            <p className="text-lg font-semibold text-gray-900">Dr. {appointment.doctor.user.full_name}</p>
                            {appointment.doctor.specialization && appointment.doctor.specialization.length > 0 && (
                                <p className="text-sm text-primary-600">
                                    {appointment.doctor.specialization.map(s => s.name).join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Time</p>
                                <p className="font-semibold text-gray-900">{formatTime(appointment.appointment_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Consultation Type</p>
                            <p className="font-semibold text-gray-900 capitalize">
                                {appointment.appointment_type.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    {/* Symptoms/Disease */}
                    {appointment.symptoms && (
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">Reason for Visit / Symptoms</p>
                                <p className="font-medium text-gray-900 mt-1">{appointment.symptoms}</p>
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    {appointment.notes && (
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">Additional Notes</p>
                                <p className="font-medium text-gray-900 mt-1">{appointment.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                Pending Approval
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Your appointment is awaiting doctor confirmation</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Information */}
            <div className="card bg-blue-50 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• You will receive a confirmation once the doctor approves your appointment</li>
                            <li>• Please arrive 10 minutes early for in-person consultations</li>
                            <li>• For online consultations, you'll receive a video call link via email</li>
                            <li>• You can view or cancel this appointment from "My Appointments"</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/app/appointments" className="flex-1 btn-primary text-center">
                    View My Appointments
                </Link>
                <Link to="/app/doctors" className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-center font-medium">
                    Book Another Appointment
                </Link>
            </div>
        </div>
    )
}

export default BookingConfirmation
