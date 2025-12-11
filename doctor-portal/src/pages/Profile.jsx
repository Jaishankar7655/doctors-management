import { useEffect, useState } from 'react'
import { doctorService } from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await doctorService.getProfile()
      setProfile(data)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">My Profile 👤</h1>
        <p className="text-primary-100 text-lg">View and manage your professional information</p>
      </div>

      {/* Approval Status Banner */}
      {profile && !profile.is_approved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-800">Pending Approval</h3>
              <p className="text-yellow-700 mt-1">
                Your profile is pending admin approval. Once approved, you will appear in the patient portal for bookings.
                Please contact the administrator for approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile && profile.is_approved && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-800">Profile Approved</h3>
              <p className="text-green-700 mt-1">
                Your profile is approved and visible to patients. You can now receive appointment bookings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {profile?.user.first_name[0]}{profile?.user.last_name[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile?.user.full_name}</h2>
            <p className="text-gray-600">{profile?.user.email}</p>
            {profile?.specialization && profile.specialization.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.specialization.map((spec) => (
                  <span
                    key={spec.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Experience</p>
            <p className="text-2xl font-bold text-gray-900">{profile?.experience_years || 0} years</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
            <p className="text-2xl font-bold text-gray-900">${profile?.consultation_fee || '0.00'}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.rating ? `${profile.rating} ⭐` : 'No ratings yet'}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{profile?.total_reviews || 0}</p>
          </div>
        </div>

        {profile?.qualification && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Qualification</p>
            <p className="text-lg font-semibold text-gray-900">{profile.qualification}</p>
          </div>
        )}

        {profile?.clinic_address && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Clinic Address</p>
            <p className="text-lg text-gray-900">{profile.clinic_address}</p>
            {(profile.clinic_city || profile.clinic_state) && (
              <p className="text-sm text-gray-600 mt-1">
                {profile.clinic_city}, {profile.clinic_state} {profile.clinic_pincode}
              </p>
            )}
          </div>
        )}

        {profile?.online_consultation_available && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-800 font-semibold flex items-center">
              <span className="mr-2">💻</span>
              Online consultations available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
