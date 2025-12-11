import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { doctorService } from '../../services/api'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    // User fields
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    // Doctor fields
    experience_years: '',
    qualification: '',
    registration_number: '',
    consultation_fee: '',
    specialization_ids: [],
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_pincode: '',
    online_consultation_available: false,
  })
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const data = await doctorService.getSpecialties()
      setSpecialties(data.results || data)
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSpecialtyChange = (specialtyId) => {
    setFormData(prev => {
      const ids = prev.specialization_ids.includes(specialtyId)
        ? prev.specialization_ids.filter(id => id !== specialtyId)
        : [...prev.specialization_ids, specialtyId]
      return { ...prev, specialization_ids: ids }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.experience_years || !formData.consultation_fee) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      await register(formData)
      toast.success('Registration successful! Your account is pending admin approval.')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Registration failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-8">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-primary-600">Doctor Registration</h2>
          <p className="mt-2 text-center text-gray-600">Create your doctor account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="input-field"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="input-field"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience_years"
                  required
                  min="0"
                  className="input-field"
                  value={formData.experience_years}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g., MBBS, MD, etc."
                  className="input-field"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  className="input-field"
                  value={formData.registration_number}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialties.map((specialty) => (
                  <label key={specialty.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialization_ids.includes(specialty.id)}
                      onChange={() => handleSpecialtyChange(specialty.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{specialty.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Clinic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                <textarea
                  name="clinic_address"
                  rows="2"
                  className="input-field"
                  value={formData.clinic_address}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="clinic_city"
                    className="input-field"
                    value={formData.clinic_city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="clinic_state"
                    className="input-field"
                    value={formData.clinic_state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="clinic_pincode"
                    className="input-field"
                    value={formData.clinic_pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="online_consultation_available"
                    checked={formData.online_consultation_available}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Available for online consultations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password_confirm"
                  required
                  className="input-field"
                  value={formData.password_confirm}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register as Doctor'}
            </button>
          </div>
          <div className="text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-700">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register

