import { useState, useEffect } from 'react'
import { patientService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Profile = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [profile, setProfile] = useState({
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        emergency_contact: '',
        medical_history: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const data = await patientService.getProfile()
            setProfile({
                date_of_birth: data.date_of_birth || '',
                gender: data.gender || '',
                blood_group: data.blood_group || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                pincode: data.pincode || '',
                emergency_contact: data.emergency_contact || '',
                medical_history: data.medical_history || ''
            })
        } catch (error) {
            toast.error('Failed to load profile')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await patientService.updateProfile(profile)
            toast.success('Profile updated successfully')
            setEditing(false)
            fetchProfile()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={user?.full_name || ''}
                                disabled
                                className="input-field bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="input-field bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={user?.phone || ''}
                                disabled
                                className="input-field bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={profile.date_of_birth}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <select
                                name="blood_group"
                                value={profile.blood_group}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                name="address"
                                rows={3}
                                value={profile.address}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                placeholder="Enter your full address"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={profile.state}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={profile.pincode}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                            <input
                                type="tel"
                                name="emergency_contact"
                                value={profile.emergency_contact}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                placeholder="Emergency contact number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                            <textarea
                                name="medical_history"
                                rows={5}
                                value={profile.medical_history}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                                placeholder="Enter any relevant medical history, allergies, chronic conditions, etc."
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {editing && (
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false)
                                fetchProfile()
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}

export default Profile
