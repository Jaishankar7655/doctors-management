import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        setLoading(true)
        try {
            const { confirmPassword, ...userData } = formData
            const result = await register(userData)
            if (result.success) {
                toast.success('Registration successful!')
                navigate('/app/dashboard')
            } else {
                toast.error(result.error || 'Registration failed')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="text-3xl font-bold text-center text-primary-600">Patient Registration</h2>
                    <p className="text-center text-gray-600 mt-2">Create your account to book appointments</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="input-field mt-1"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="input-field mt-1"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            pattern="[0-9]{10}"
                            className="input-field mt-1"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength="6"
                            className="input-field mt-1"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="input-field mt-1"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-primary">
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                    <div className="text-center space-y-2">
                        <Link to="/login" className="block text-primary-600 hover:text-primary-700">
                            Already have an account? Login here
                        </Link>
                        <Link to="/" className="block text-gray-600 hover:text-gray-700 text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register
