'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation';

type employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  telephone: string
  role: string
  employment_type: string
  hourly_rate: number
  contract_hours: number
  holiday_allowance: number
  status: string
}

type availability = {
  id: string
  employee_id: string
  days_of_week: string
  start_time: string
  end_time: string
  available: boolean
}

type holiday = {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  days_requested: number
  status: 'pending' | 'approved' | 'rejected'
  notes: string
}

export default function EmployeeProfilePage() {

  const Params = useParams()
  const employeeId = Params.id as string
  const router = useRouter()
  const [employee, setEmployee] = useState<employee | null>(null)
  const [loading, setLoading] = useState(true)

  const [ activeTab, setActiveTab] = useState('profile')
  const [holidays, setHolidays] = useState<holiday[]>([])
  const [newHoliday, setNewHoliday] = useState({
    start_date: '',
    end_date: '',
    notes: '',
    status: 'pending',
  })
  const [availability, setAvailability] = useState<availability[]>([])
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null)
  const [newAvailability, setNewAvailability] = useState({
        'days_of_week': 'Monday',
        'start_time': '',
        'end_time': '',
        'available': true,
      })
  const [editingHoliday, setEditingHoliday] = useState<holiday | null>(null)

  const saveAvailability = async () => {
    const existingRecord = availability.find(
      (item) =>
        item.days_of_week === newAvailability.days_of_week &&
        item.id !== editingAvailabilityId
    )

    if (existingRecord) {
      alert(`Availability for ${newAvailability.days_of_week} already exists. Please edit the existing record.`)
      return
    }

    if (editingAvailabilityId) {
      const { data: updatedRecord, error } = await supabase
        .from('availability')
        .update({
          days_of_week: newAvailability.days_of_week,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
          available: newAvailability.available,
        })
        .eq('employee_id', employeeId)
        .eq('id', editingAvailabilityId)
        .select('*')
        .maybeSingle()

      if (error) {
        console.error(error)
        alert('Failed to update availability')
        return
      }

      if (!updatedRecord) {
        alert('No availability record was updated. Please check permissions (RLS) or refresh and try again.')
        return
      }

      setAvailability((prev) =>
        prev
          .map((item) => (item.id === updatedRecord.id ? (updatedRecord as availability) : item))
          .sort((a, b) => a.days_of_week.localeCompare(b.days_of_week))
      )
    } else {
      const { error } = await supabase
        .from('availability')
        .insert({
          employee_id: employeeId,
          days_of_week: newAvailability.days_of_week,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
          available: newAvailability.available,
        })

      if (error) {
        console.error(error)
        alert('Failed to add availability')
        return
      }
    }

    if (!editingAvailabilityId) {
      const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('employee_id', employeeId)
        .order('days_of_week', { ascending: true })

      setAvailability(data || [])
    }
    setEditingAvailabilityId(null)
    setNewAvailability({
      'days_of_week': 'Monday',
      'start_time': '',
      'end_time': '',
      'available': true,
    })
  }

  const cancelAvailabilityEdit = () => {
    setEditingAvailabilityId(null)
    setNewAvailability({
      'days_of_week': 'Monday',
      'start_time': '',
      'end_time': '',
      'available': true,
    })
  }

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single()

      if (error) {
        console.error(error)
        alert('Failed to load employee')
        setLoading(false)
        return
      }
      else {
        setEmployee(data)
      }

      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('employee_id', employeeId).order('days_of_week', { ascending: true })

      if (availabilityError) {
        console.error(availabilityError)
        alert('Failed to load availability')
      } else {
        setAvailability(availabilityData || [])
      }

      setLoading(false)

      const {
        data: holidayData, error: holidayError } = await supabase
          .from('holidays')
          .select('*')
          .eq('employee_id', employeeId)
          .order('start_date', { ascending: false })

      if (holidayError) {
        console.error(holidayError)
        alert('Failed to load holidays')
      } else {
        setHolidays(holidayData || [])
      }
    }

    loadEmployee()
  }, [employeeId])

  if (loading) {
    return (
      <p>Loading...</p>
    )
  }

  if (!employee) {
    return (
      <p>Employee not found</p>
    )
  }

  const editAvailability = (id: string) => {
    const availabilityToEdit = availability.find((item) => item.id === id)
    if (!availabilityToEdit) return

    setEditingAvailabilityId(id)
    setNewAvailability({
      days_of_week: availabilityToEdit.days_of_week,
      start_time: availabilityToEdit.start_time,
      end_time: availabilityToEdit.end_time,
      available: availabilityToEdit.available,
    })
  }

  const deleteAvailability = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this availability?')
    if (!confirmed) return

    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)


    if (error) {
      console.error(error)
      alert('Failed to delete availability')
      return
    }
    setAvailability((prev) => prev.filter((item) => item.id !== id))
  }

  const submitHoliday = async () => {
    if (!newHoliday.start_date || !newHoliday.end_date) {
      alert('Please fill in both start and end dates.')
      return
    }
    const start = new Date(newHoliday.start_date)
    const end = new Date(newHoliday.end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const error = await supabase
      .from('holidays')
      .insert({
        employee_id: employeeId,
        start_date: newHoliday.start_date,
        end_date: newHoliday.end_date,
        days_requested: days,
        status: 'pending',
        notes: newHoliday.notes,
      })
      if (error.error) {
        console.error(error.error)
        alert('Failed to submit holiday request')
        return
      }
      const { data: holidayData, error: holidayError } = await supabase
        .from('holidays')
        .select('*')
        .eq('employee_id', employeeId)

      if (holidayError) {
        console.error(holidayError)
        alert('Failed to refresh holiday requests')
        return
      }

      setHolidays(holidayData || [])
      setNewHoliday({
        start_date: '',
        end_date: '',
        notes: '',
        status: 'pending',
      })
  }
  

  const updateHolidayStatus = async (holidayId: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('holidays')
      .update({ status })
      .eq('id', holidayId)

    if (error) {
      console.error(error)
      alert('Failed to update holiday status')
      return
    }

    setHolidays(holidays.map((holiday) =>
      holiday.id === holidayId ? { ...holiday, status } : holiday
    ))
  }

  const saveHolidayEdit = async () => {
    if (!editingHoliday) return

    const start = new Date(editingHoliday.start_date)
    const end = new Date(editingHoliday.end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const { error } = await supabase
      .from('holidays')
      .update({
        start_date: editingHoliday.start_date,
        end_date: editingHoliday.end_date,
        notes: editingHoliday.notes,
        days_requested: days,
        status: 'pending',
      })
      .eq('id', editingHoliday.id)

      if (error) {
        console.error(error)
        alert('Failed to update holiday request')
        return
      }

      setHolidays(holidays.map((holiday) =>
        holiday.id === editingHoliday.id
          ? {
              ...holiday,
              start_date: editingHoliday.start_date,
              end_date: editingHoliday.end_date,
              notes: editingHoliday.notes,
              days_requested: days,
              status: 'pending',
            }
          : holiday
      ))
      setEditingHoliday(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex-justify-center text-2xl font-bold mb-4">
      <div>
        <h1 className="text-3xl font-bold mb-6">{
          employee.first_name} {' '} {employee.last_name}
        </h1>
        <p className="text-gray-500">{employee.role}</p>
      </div>

      <button onClick={() => router.push(`/admin/employees/${employee.id}/edit`)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Edit Employee
      </button>
      </div>

      <div className="flex gap-2 mb-6 border-b pb-3">
        {['profile', 'availability', 'shifts', 'holiday', 'notes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="max-w-4xl mx-auto p-4">
            <div>
              <strong>Email:</strong> {' '} {employee.email}
            </div>

            <div>
              <strong>Telephone:</strong> {' '} {employee.telephone || '-'}
            </div>

            <div>
              <strong>Employment Type:</strong> {' '} {employee.employment_type}
            </div>

            <div>
              <strong>Hourly Rate:</strong> {' '} £{employee.hourly_rate}
            </div>

            <div>
              <strong>Contract Hours:</strong> {' '} {employee.contract_hours}
            </div>

            <div>
              <strong>Holiday Allowance:</strong> {' '} {employee.holiday_allowance} {' '} days
            </div>

            <div>
              <strong>Status:</strong> {' '} {employee.status}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'availability' && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Availability</h2>

            
              <div className="mb-6 border rounded-xl p-4 space-y-4">

                <select
                  title="Select day of week"
                  value={newAvailability.days_of_week}
                  onChange={(e) => setNewAvailability({ ...newAvailability, days_of_week: e.target.value, })}
                  className="border rounded-lg p-2"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>

                <input type="time" placeholder="Start Time" value={newAvailability.start_time} onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })} className="border rounded-lg p-2" />

                <input type="time" placeholder="End Time" value={newAvailability.end_time} onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })} className="border rounded-lg p-2" />

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newAvailability.available} onChange={(e) => setNewAvailability({ ...newAvailability, available: e.target.checked })} />
                  Available
                </label>

                <div className="flex gap-2">
                  <button onClick={saveAvailability} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    {editingAvailabilityId ? 'Update Availability' : 'Add Availability'}
                  </button>
                  {editingAvailabilityId && (
                    <button onClick={cancelAvailabilityEdit} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            

              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Day</th>
                    <th className="border border-gray-300 p-2 text-left">Start Time</th>
                    <th className="border border-gray-300 p-2 text-left">End Time</th>
                    <th className="border border-gray-300 p-2 text-left">Availability</th>
                    <th className="border border-gray-300 p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availability.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">{item.days_of_week}</td>
                      <td className="border border-gray-300 p-2">{item.start_time}</td>
                      <td className="border border-gray-300 p-2">{item.end_time}</td>
                      <td className="border border-gray-300 p-2">{item.available ? '✅Available' : '❌Not Available'}</td>
                      
                      <td className="border border-gray-300 space-x-2 p-2">
                        <button onClick={() => editAvailability(item.id)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                          Edit
                        </button>
                        <button onClick={() => deleteAvailability(item.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="max-w-4xl mx-auto p-4">
          <p>Assigned shifts coming soon</p>
        </div>
      )}

      {activeTab === 'holiday' && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6 border rounded-xl p-4 space-y-4">
            <div>
              Holiday Summary
            </div>
            <p>Holiday Allowance: {' '} {employee.holiday_allowance} days</p>
        </div>
        <div className="border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold">Request Holiday</h3>
          <label className="flex items-center gap-2">
            <span>Start Date:</span>
            <input type="date" value={newHoliday.start_date} onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })} className="border rounded-lg p-2" />
          </label>
          <label className="flex items-center gap-2">
            <span>End Date:</span>
            <input type="date" value={newHoliday.end_date} onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })} className="border rounded-lg p-2" />
          </label>
          <textarea placeholder="Notes" value={newHoliday.notes} onChange={(e) => setNewHoliday({ ...newHoliday, notes: e.target.value })} className="border rounded-lg p-2 w-full" />
          <button onClick={submitHoliday} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Submit Holiday Request
          </button>
        </div>
        <div>
          <h3 className="font-semibold mt-6">Previous Holiday Requests</h3>
          {holidays.length === 0 ? (
            <p>No holiday requests found.</p>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Start Date</th>
                  <th className="border border-gray-300 p-2 text-left">End Date</th>
                  <th className="border border-gray-300 p-2 text-left">Days Requested</th>
                  <th className="border border-gray-300 p-2 text-left">Status</th>
                  <th className="border border-gray-300 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td className="border border-gray-300 p-2">{holiday.start_date}</td>
                    <td className="border border-gray-300 p-2">{holiday.end_date}</td>
                    <td className="border border-gray-300 p-2">{holiday.days_requested}</td>
                    <td className="border border-gray-300 p-2">{holiday.status}</td>
                    <td className="border border-gray-300 p-2">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingHoliday(holiday)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                          Edit
                        </button>
                        {holiday.status === 'pending' && (
                          <>
                      <div className="flex gap-2">
                          <button onClick= {() => updateHolidayStatus(holiday.id, 'approved')}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                            Approve
                          </button>
                          <button onClick={() => updateHolidayStatus(holiday.id, 'rejected')}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Reject
                          </button>
                        </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
            {editingHoliday && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <h3 className="font-semibold mb-4">Edit Holiday Request</h3>
                <label className="flex items-center gap-2">
                  <span>Start Date:</span>
                  <input type="date" value={editingHoliday.start_date} onChange={(e) => setEditingHoliday({ ...editingHoliday, start_date: e.target.value })} className="border rounded-lg p-2" />
                </label>
                <label className="flex items-center gap-2">
                  <span>End Date:</span>
                  <input type="date" value={editingHoliday.end_date} onChange={(e) => setEditingHoliday({ ...editingHoliday, end_date: e.target.value })} className="border rounded-lg p-2" />
                </label>
                <label className="flex items-center gap-2">
                  <span>Notes:</span>
                  <textarea placeholder="Notes" value={editingHoliday.notes} onChange={(e) => setEditingHoliday({ ...editingHoliday, notes: e.target.value })} className="border rounded-lg p-2 w-full" />
                </label>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveHolidayEdit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Save
                  </button>
                  <button onClick={() => setEditingHoliday(null)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cancel
                  </button>
                </div>
              </div>
            )}
        </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="max-w-4xl mx-auto p-4">
          <p>Notes coming soon</p>
        </div>
      )}
    </div>
  )
}

