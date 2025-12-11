import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorService } from '../services/api'
import toast from 'react-hot-toast'

const DoctorDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDoctorDetails()
    }, [id])

    const fetchDoctorDetails = async () => {
        setLoading(true)
        try {
            const data = await doctorService.getById(id)
            setDoctor(data)
        } catch (error) {
            toast.error('Failed to load doctor details')
            console.error(error)
            navigate('/app/doctors')
        } finally {
            setLoading(false)
        }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary-600">
                                    {doctor.user.full_name.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dr. {doctor.user.full_name}</h1>
                            {doctor.specialization && doctor.specialization.length > 0 && (
                                <p className="text-lg text-primary-600 mt-1">
                                    {doctor.specialization.map(s => s.name).join(', ')}
                                </p>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {parseFloat(doctor.rating).toFixed(1)} ({doctor.total_reviews} reviews)
                                </span>
                                <span>•</span>
                                <span>{doctor.experience_years} years experience</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary-600">₹{doctor.consultation_fee}</p>
                        <p className="text-sm text-gray-500">Consultation Fee</p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => navigate(`/app/book-appointment/${doctor.id}`)}
                        className="w-full btn-primary"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Professional Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                    <div className="space-y-3">
                        {doctor.qualification && (
                            <div>
                                <p className="text-sm text-gray-500">Qualification</p>
                                <p className="text-base text-gray-900">{doctor.qualification}</p>
                            </div>
                        )}
                        {doctor.registration_number && (
                            <div>
                                <p className="text-sm text-gray-500">Registration Number</p>
                                <p className="text-base text-gray-900">{doctor.registration_number}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Experience</p>
                            <p className="text-base text-gray-900">{doctor.experience_years} years</p>
                        </div>
                        {doctor.specialization && doctor.specialization.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500">Specializations</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {doctor.specialization.map(spec => (
                                        <span key={spec.id} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                            {spec.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Clinic Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinic Information</h2>
                    <div className="space-y-3">
                        {doctor.clinic_address && (
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-base text-gray-900">{doctor.clinic_address}</p>
                            </div>
                        )}
                        {(doctor.clinic_city || doctor.clinic_state) && (
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="text-base text-gray-900">
                                    {doctor.clinic_city}{doctor.clinic_state ? `, ${doctor.clinic_state}` : ''}
                                    {doctor.clinic_pincode ? ` - ${doctor.clinic_pincode}` : ''}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Consultation Type</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    In-Person
                                </span>
                                {doctor.online_consultation_available && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        Online Available
                                    </span>
                                )}
                            </div>
                        </div>
                        {doctor.user.email && (
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-base text-gray-900">{doctor.user.email}</p>
                            </div>
                        )}
                        {doctor.user.phone && (
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-base text-gray-900">{doctor.user.phone}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            {doctor.reviews && doctor.reviews.length > 0 && (
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Reviews</h2>
                    <div className="space-y-4">
                        {doctor.reviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{review.patient?.user?.full_name || 'Anonymous'}</p>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-gray-600">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorDetails
