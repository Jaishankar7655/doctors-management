import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorService, appointmentService } from '../services/api'
import toast from 'react-hot-toast'

const BookAppointment = () => {
    const { doctorId } = useParams()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [availableSlots, setAvailableSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    const [formData, setFormData] = useState({
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'in_person',
        symptoms: '',
        notes: ''
    })

    useEffect(() => {
        fetchDoctorDetails()
    }, [doctorId])

    useEffect(() => {
        if (formData.appointment_date) {
            fetchAvailableSlots()
        }
    }, [formData.appointment_date])

    const fetchDoctorDetails = async () => {
        setLoading(true)
        try {
            const data = await doctorService.getById(doctorId)
            setDoctor(data)
        } catch (error) {
            toast.error('Failed to load doctor details')
            navigate('/app/doctors')
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true)
        try {
            const data = await doctorService.getAvailableSlots(doctorId, formData.appointment_date)
            setAvailableSlots(data.available_slots || [])
            if (data.available_slots && data.available_slots.length === 0) {
                toast.error('No slots available for this date')
            }
        } catch (error) {
            toast.error('Failed to load available slots')
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Reset time slot when date changes
        if (name === 'appointment_date') {
            setFormData(prev => ({ ...prev, appointment_time: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.appointment_time) {
            toast.error('Please select a time slot')
            return
        }

        setSubmitting(true)
        try {
            const newAppointment = await appointmentService.create({
                doctor_id: parseInt(doctorId),
                ...formData
            })
            toast.success('Appointment booked successfully!')
            navigate('/app/booking-confirmation', {
                state: { appointment: newAppointment }
            })
        } catch (error) {
            console.error('Booking error:', error)
            const errorMessage = error.response?.data?.error
                || error.response?.data?.doctor_id?.[0]
                || error.response?.data?.appointment_time?.[0]
                || 'Failed to book appointment'
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const getMinDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const getMaxDate = () => {
        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + 30) // Allow booking up to 30 days in advance
        return maxDate.toISOString().split('T')[0]
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!doctor) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary-600 hover:text-primary-700 flex items-center mb-4"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            </div>

            {/* Doctor Info */}
            <div className="card">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                            {doctor.user.full_name.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Dr. {doctor.user.full_name}</h2>
                        {doctor.specialization && doctor.specialization.length > 0 && (
                            <p className="text-sm text-primary-600">
                                {doctor.specialization.map(s => s.name).join(', ')}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                            Consultation Fee: <span className="font-semibold text-primary-600">₹{doctor.consultation_fee}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>

                <div className="space-y-6">
                    {/* Appointment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="appointment_type"
                                    value="in_person"
                                    checked={formData.appointment_type === 'in_person'}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">In-Person Visit</span>
                            </label>
                            {doctor.online_consultation_available && (
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="appointment_type"
                                        value="online"
                                        checked={formData.appointment_type === 'online'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Online Consultation</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="appointment_date"
                            required
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="input-field"
                            value={formData.appointment_date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Time Slot Selection */}
                    {formData.appointment_date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Time Slot <span className="text-red-500">*</span>
                            </label>
                            {loadingSlots ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-600">No available slots for this date</p>
                                    <p className="text-sm text-gray-500 mt-1">Please select a different date</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {availableSlots.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, appointment_time: slot }))}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.appointment_time === slot
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Symptoms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Symptoms <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="symptoms"
                            required
                            rows={3}
                            placeholder="Describe your symptoms..."
                            className="input-field"
                            value={formData.symptoms}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Any additional information for the doctor..."
                            className="input-field"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={submitting || !formData.appointment_time}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default BookAppointment
