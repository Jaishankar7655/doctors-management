import { Link } from 'react-router-dom'

const DoctorCard = ({ doctor, onBookAppointment, isPublic = false }) => {
    const cardContent = (
        <div className="card hover:shadow-xl transition-shadow duration-300 cursor-pointer">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                            {doctor.user.full_name.charAt(0)}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        Dr. {doctor.user.full_name}
                    </h3>
                    <div className="mt-1 space-y-1">
                        {doctor.specialization && doctor.specialization.length > 0 && (
                            <p className="text-sm text-primary-600 font-medium">
                                {doctor.specialization.map(s => s.name).join(', ')}
                            </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {parseFloat(doctor.rating).toFixed(1)} ({doctor.total_reviews} reviews)
                            </span>
                            <span>{doctor.experience_years} years exp.</span>
                        </div>
                        {doctor.clinic_city && (
                            <p className="text-sm text-gray-600">
                                📍 {doctor.clinic_city}{doctor.clinic_state ? `, ${doctor.clinic_state}` : ''}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-lg font-bold text-primary-600">₹{doctor.consultation_fee}</p>
                    <p className="text-xs text-gray-500">Consultation Fee</p>
                    {doctor.online_consultation_available && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                            Online Available
                        </span>
                    )}
                    {isPublic && onBookAppointment && (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                onBookAppointment(doctor.id)
                            }}
                            className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                        >
                            Book Appointment
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    if (isPublic) {
        return cardContent
    }

    return (
        <Link to={`/app/doctors/${doctor.id}`}>
            {cardContent}
        </Link>
    )
}

export default DoctorCard
