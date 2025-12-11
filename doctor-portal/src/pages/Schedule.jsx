import { useEffect, useState } from 'react'
import { doctorService } from '../services/api'
import toast from 'react-hot-toast'

const Schedule = () => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const data = await doctorService.getSchedule()
      setSchedule(data.results || data)
    } catch (error) {
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
      <div className="card">
        <div className="space-y-4">
          {days.map((day, index) => {
            const daySchedule = schedule.find(s => s.day_of_week === index)
            return (
              <div key={index} className="border-b pb-4">
                <h3 className="font-semibold mb-2">{day}</h3>
                {daySchedule ? (
                  <div className="text-sm text-gray-600">
                    {daySchedule.start_time} - {daySchedule.end_time} ({daySchedule.slot_duration} min slots)
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Not available</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Schedule

