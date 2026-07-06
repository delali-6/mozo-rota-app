'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Employee = {
  id: string
  first_name: string
  last_name: string
  job_title: string
}

type Shift = {
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  break_minutes: number
  shift_role: string
  notes: string
  is_open_shift: boolean
  status: string
}

const emptyShift: Shift = {
  employee_id: '',
  shift_date: '',
  start_time: '',
  end_time: '',
  break_minutes: 0,
  shift_role: '',
  notes: '',
  is_open_shift: false,
  status: 'scheduled',
}

// Admin editor for an existing shift, including assignment, timing, notes, and status.
export default function EditShiftPage() {
  const params = useParams()
  const router = useRouter()

  const [shift, setShift] = useState<Shift>(emptyShift)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Loads active employees and the selected shift together so the form can render fully populated.
    const loadData = async () => {
      const [{ data: employeeData, error: employeeError }, { data: shiftData, error: shiftError }] = await Promise.all([
        supabase
          .from('employees')
          .select('*')
          .eq('status', 'active')
          .order('first_name'),
        supabase
          .from('shifts')
          .select('*')
          .eq('id', params.id)
          .single(),
      ])

      if (!employeeError) {
        setEmployees(employeeData || [])
      }

      if (shiftError) {
        console.error(shiftError)
        setLoading(false)
        return
      }

      setShift(shiftData)
      setLoading(false)
    }

    loadData()
  }, [params.id])

  // Saves the edited shift back to Supabase and returns to the shift list on success.
  async function updateShift() {
    setSaving(true)

    const { error } = await supabase
      .from('shifts')
      .update(shift)
      .eq('id', params.id)

    setSaving(false)

    if (error) {
      console.error(error)
      alert('Failed to update shift')
      return
    }

    alert('Shift updated successfully!')
    router.push('/admin/shifts')
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    )
  }

  

  return (
    <main className="max-w-4xl mx-auto p-8">

      <h1 className="mozo-title mb-8">
        Edit Shift
      </h1>

      <div className="mozo-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="mozo-field-label">
            Employee
          </label>

          <select
            className={`mozo-select ${selectedEmployeeId ? 'text-[var(--mozo-black)]' : 'text-[var(--mozo-text-secondary)]'}`}
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value)
              setShift({
                ...shift,
                employee_id: e.target.value,
              })
            }}
            aria-label="Select employee"
            required
          >
            <option value="" disabled hidden className="text-[var(--mozo-text-secondary)]">
              Select employee
            </option>
            
            {employees.map((employee) => (
              <option
                key={employee.id}
                value={employee.id}
                className="bg-white text-[var(--mozo-black)]"
              >
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mozo-field-label">
            Date
          </label>

          <input
            type="date"
            className="mozo-input"
            value={shift.shift_date}
            onChange={(e) =>
              setShift({
                ...shift,
                shift_date: e.target.value,
              })
            }
            title="Shift Date"
          />
        </div>

        <div>
          <label className="mozo-field-label">
            Start Time
          </label>

          <input
            type="time"
            className="mozo-input"
            value={shift.start_time}
            onChange={(e) =>
              setShift({
                ...shift,
                start_time: e.target.value,
              })
            }
            title="Start Time"
          />
        </div>

        <div>
          <label className="mozo-field-label">
            End Time
          </label>

          <input
            type="time"
            className="mozo-input"
            value={shift.end_time}
            onChange={(e) =>
              setShift({
                ...shift,
                end_time: e.target.value,
              })
            }
            title="End Time"
          />
        </div>

        <div>
          <label className="mozo-field-label">
            Break (minutes)
          </label>

          <input
            type="number"
            className="mozo-input"
            value={shift.break_minutes}
            onChange={(e) =>
              setShift({
                ...shift,
                break_minutes: Number(e.target.value),
              })
            }
            title="Break Minutes"
          />
        </div>

        <div>
          <label className="mozo-field-label">
            Shift Role
          </label>

          <input
            type="text"
            className="mozo-input"
            value={shift.shift_role}
            onChange={(e) =>
              setShift({
                ...shift,
                shift_role: e.target.value,
              })
            }
            title="Shift Role"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mozo-field-label">
            Notes
          </label>

          <textarea
            rows={4}
            className="mozo-textarea"
            value={shift.notes}
            onChange={(e) =>
              setShift({
                ...shift,
                notes: e.target.value,
              })
            }
            title="Shift Notes"
          />
        </div>

        <div>
          <label className="mozo-field-label">
            Status
          </label>

          <select
            className="mozo-select"
            value={shift.status}
            onChange={(e) =>
              setShift({
                ...shift,
                status: e.target.value,
              })
            }
            title="Shift Status"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      <div className="mt-8 flex gap-4">

        <button
          onClick={() => router.back()}
          className="mozo-btn mozo-btn-outline"
        >
          Cancel
        </button>

        <button
          onClick={updateShift}
          disabled={saving}
          className="mozo-btn mozo-btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>

    </main>
  )
}
