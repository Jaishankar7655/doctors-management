import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { doctorService } from '../services/api'
import DoctorCard from '../components/doctors/DoctorCard'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PublicDoctors = () => {
    const [doctors, setDoctors] = useState([])
    const [specialties, setSpecialties] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        specialization: '',
        city: '',
        online_consultation_available: '',
        ordering: '-rating'
    })
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        fetchSpecialties()
        fetchDoctors()
    }, [])

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchDoctors()
        }, 500)
        return () => clearTimeout(debounce)
    }, [filters])

    const fetchSpecialties = async () => {
        try {
            const data = await doctorService.getSpecialties()
            // Ensure data is an array
            setSpecialties(Array.isArray(data) ? data : data.results || [])
        } catch (error) {
            console.error('Failed to fetch specialties:', error)
            setSpecialties([]) // Set empty array on error
        }
    }

    const fetchDoctors = async () => {
        setLoading(true)
        try {
            const params = {}
            if (filters.search) params.search = filters.search
            if (filters.specialization) params.specialization = filters.specialization
            if (filters.city) params.clinic_city = filters.city
            if (filters.online_consultation_available) params.online_consultation_available = filters.online_consultation_available
            if (filters.ordering) params.ordering = filters.ordering

            const data = await doctorService.list(params)
            setDoctors(Array.isArray(data) ? data : data.results || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
            toast.error('Failed to load doctors. Please try again.')
            setDoctors([])
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            specialization: '',
            city: '',
            online_consultation_available: '',
            ordering: '-rating'
        })
    }

    const handleBookAppointment = (doctorId) => {
        // Check if user is logged in
        if (!user) {
            toast.error('Please login to book an appointment')
            navigate('/login')
        } else {
            navigate(`/app/book-appointment/${doctorId}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">HealthCare</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/app/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                                        Dashboard
                                    </Link>
                                    <Link to="/app/appointments" className="text-gray-700 hover:text-primary-600 font-medium">
                                        My Appointments
                                    </Link>
                                    <span className="text-sm text-gray-600">
                                        {user.full_name || user.email}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn-primary">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
                        <p className="text-gray-600 mt-1">Browse our network of qualified healthcare professionals</p>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name, specialty, or location..."
                                className="input-field"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        {/* Specialty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                            <select
                                className="input-field"
                                value={filters.specialization}
                                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                            >
                                <option value="">All Specialties</option>
                                {specialties.map(specialty => (
                                    <option key={specialty.id} value={specialty.id}>
                                        {specialty.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Online Consultation Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                            <select
                                className="input-field"
                                value={filters.online_consultation_available}
                                onChange={(e) => handleFilterChange('online_consultation_available', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="true">Online Available</option>
                                <option value="false">In-Person Only</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                className="input-field"
                                value={filters.ordering}
                                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                            >
                                <option value="-rating">Highest Rated</option>
                                <option value="rating">Lowest Rated</option>
                                <option value="-experience_years">Most Experienced</option>
                                <option value="experience_years">Least Experienced</option>
                                <option value="consultation_fee">Lowest Fee</option>
                                <option value="-consultation_fee">Highest Fee</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-12 card">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-4">
                            {doctors.map(doctor => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onBookAppointment={handleBookAppointment}
                                    isPublic={true}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PublicDoctors
