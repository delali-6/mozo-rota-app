'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ShiftForm, { type NewShift } from './components/ShiftForm'
import ShiftTable, { type Shift } from './components/ShiftTable'

type Employee = {
  id: string
  first_name: string
  last_name: string
  status: string
}

const emptyShift: NewShift = {
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

// Admin shift management page for creating, viewing, and deleting assigned or open shifts.
export default function ShiftsPage() {
  const [newShift, setNewShift] = useState<NewShift>(emptyShift)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Active employees populate the assigned-shift dropdown.
  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')

    if (error) {
      console.error('Failed to load employees:', error)
      return
    }

    setEmployees(data || [])
  }

  // Loads shifts with employee names for the management table.
  const loadShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        employees!shifts_employee_id_fkey1 (first_name, last_name)
      `)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Failed to load shifts:', error)
      return
    }

    setShifts(data || [])
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadEmployees(), loadShifts()])
      setLoading(false)
    }

    loadData()
  }, [])

  // Validates the form and inserts a new shift record into Supabase.
  const createShift = async () => {
    setFormError(null)

    if (!newShift.shift_date || !newShift.start_time || !newShift.end_time) {
      setFormError('Please fill in all required fields.')
      return
    }
    if (!newShift.is_open_shift && !newShift.employee_id) {
      setFormError('Please select an employee for the assigned shift.')
      return
    }

    setSaving(true)

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      setFormError('You must be logged in to create a shift.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('shifts').insert({
      employee_id: newShift.is_open_shift ? null : newShift.employee_id,

      is_open_shift: newShift.is_open_shift,

      shift_date: newShift.shift_date,
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      break_minutes: newShift.break_minutes,
      shift_role: newShift.shift_role,
      notes: newShift.notes,
      status: newShift.status,
    })

    setSaving(false)
    

    if (error) {
      setFormError('Failed to create shift. Please try again.')
      return
    }

    setNewShift(emptyShift)
    setShowForm(false)
    await loadShifts()
  }

  // Deletes a shift after manager confirmation, then refreshes the table.
  const deleteShift = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this shift?')
    if (!confirmed) return

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete shift:', error)
      return
    }

    await loadShifts()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="mozo-title">Shift Management</h1>
        <button
          onClick={() => {
            setShowForm((prev) => !prev)
            setFormError(null)
          }}
          className="mozo-btn mozo-btn-primary"
        >
          {showForm ? 'Cancel' : '+ Create Shift'}
        </button>
      </div>

      {showForm && (
        <ShiftForm
          employees={employees}
          newShift={newShift}
          setNewShift={setNewShift}
          createShift={createShift}
          saving={saving}
          formError={formError}
        />
      )}

      {loading ? (
        <div className="mozo-card p-4 text-sm mozo-subtitle">Loading shifts...</div>
      ) : (
        <ShiftTable shifts={shifts} deleteShift={deleteShift} />
      )}
    </div>
  )
}
