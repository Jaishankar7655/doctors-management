import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'approved', 'inactive'
  const [searchQuery, setSearchQuery] = useState('')
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/doctors/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctors(Array.isArray(response.data) ? response.data : response.data.results || [])
    } catch (error) {
      console.error('Failed to load doctors:', error)
      toast.error('Failed to load doctors')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId) => {
    if (!window.confirm('Are you sure you want to approve this doctor?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE_URL}/admin/doctors/${doctorId}/approve/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Doctor approved successfully')
      fetchDoctors()
    } catch (error) {
      toast.error('Failed to approve doctor')
    }
  }

  const handleToggleActive = async (doctor) => {
    const action = doctor.is_active ? 'disable' : 'enable'
    if (!window.confirm(`Are you sure you want to ${action} this doctor?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_BASE_URL}/doctors/${doctor.id}/`,
        { is_active: !doctor.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Doctor ${action}d successfully`)
      fetchDoctors()
    } catch (error) {
      toast.error(`Failed to ${action} doctor`)
    }
  }

  const handleDelete = async (doctorId) => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete the doctor and all associated data. This action cannot be undone. Are you sure?')) {
      return
    }

    const confirmText = window.prompt('Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      toast.error('Deletion cancelled')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE_URL}/doctors/${doctorId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Doctor deleted successfully')
      fetchDoctors()
    } catch (error) {
      toast.error('Failed to delete doctor')
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_BASE_URL}/doctors/${editingDoctor.id}/`,
        editingDoctor,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Doctor updated successfully')
      setShowEditModal(false)
      fetchDoctors()
    } catch (error) {
      toast.error('Failed to update doctor')
    }
  }

  // Filter doctors based on active tab and search
  const filteredDoctors = doctors.filter(doctor => {
    // Tab filter
    if (activeTab === 'pending' && doctor.is_approved) return false
    if (activeTab === 'approved' && !doctor.is_approved) return false
    if (activeTab === 'inactive' && doctor.is_active) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = doctor.user?.full_name?.toLowerCase() || ''
      const email = doctor.user?.email?.toLowerCase() || ''
      const city = doctor.clinic_city?.toLowerCase() || ''
      return name.includes(query) || email.includes(query) || city.includes(query)
    }

    return true
  })

  const statusCounts = {
    all: doctors.length,
    pending: doctors.filter(d => !d.is_approved).length,
    approved: doctors.filter(d => d.is_approved).length,
    inactive: doctors.filter(d => !d.is_active).length,
  }

  const tabs = [
    { id: 'all', label: 'All Doctors', count: statusCounts.all },
    { id: 'pending', label: 'Pending Approval', count: statusCounts.pending, color: 'yellow' },
    { id: 'approved', label: 'Approved', count: statusCounts.approved, color: 'green' },
    { id: 'inactive', label: 'Inactive', count: statusCounts.inactive, color: 'red' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-600 mt-1">Manage all doctors, approvals, and settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Doctors Table */}
      {filteredDoctors.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search query' : 'No doctors match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {doctor.user?.full_name?.[0] || 'D'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.user?.full_name || `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialization && doctor.specialization.length > 0 ? (
                          doctor.specialization.map((spec) => (
                            <span key={spec.id} className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                              {spec.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No specialization</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.experience_years || 0} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{doctor.consultation_fee || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${doctor.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {doctor.is_approved ? '✓ Approved' : '⏱ Pending'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${doctor.is_active
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {doctor.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        {!doctor.is_approved && (
                          <button
                            onClick={() => handleApprove(doctor.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                          >
                            ✓ Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(doctor)}
                          className={`px-3 py-1 rounded text-xs font-medium ${doctor.is_active
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          {doctor.is_active ? '⊗ Disable' : '○ Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Doctor</h2>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={editingDoctor.experience_years || 0}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, experience_years: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingDoctor.consultation_fee || 0}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, consultation_fee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editingDoctor.qualification || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={editingDoctor.registration_number || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                  <textarea
                    value={editingDoctor.clinic_address || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic_address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editingDoctor.clinic_city || ''}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editingDoctor.clinic_state || ''}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic_state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={editingDoctor.clinic_pincode || ''}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic_pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="online_consultation"
                    checked={editingDoctor.online_consultation_available || false}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, online_consultation_available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="online_consultation" className="ml-2 text-sm font-medium text-gray-700">
                    Online Consultation Available
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
