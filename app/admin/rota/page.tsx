'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { addWeeks, subWeeks,startOfWeek, addDays, format } from 'date-fns'
import { useRouter } from 'next/navigation'

type Employee = {
  id: string
  first_name: string
  last_name: string
  job_title: string
}

type Shift = {
  id: string
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
}

// Weekly rota planner for managers. Click empty cells to create shifts and existing shifts to edit them.
export default function RotaPage() {

  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newShift, setNewShift] = useState({
    start_time: "09:00",
    end_time: "17:00",
    break_minutes: 30,
    shift_role: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  // Loads active employees so the rota grid only includes staff who can be scheduled.
  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('first_name')

    if (error) {
      console.error(error)
      return
    }

    setEmployees(data || [])
  }

  // Loads all shifts so each employee/day cell can display assigned rota items.
  const loadShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('shift_date')

    if (error) {
      console.error(error)
      return
    }

    setShifts(data || [])
  }

    useEffect(() => {
      const id = window.setTimeout(() => {
        void loadEmployees()
        void loadShifts()
      }, 0)

      return () => window.clearTimeout(id)
    }, [])

    // Opens the create drawer prefilled with the clicked employee, date, and default shift times.
    const openCreateShift = (employee: Employee, date: Date) => {
      setSelectedEmployee(employee)
      setSelectedDate(date)
      setNewShift({
        start_time: "09:00",
        end_time: "17:00",
        break_minutes: 30,
        shift_role: employee.job_title || "",
        notes: "",
      })
      setShowCreateModal(true)
    }

    // Existing rota cards route to the dedicated shift edit screen.
    const openEditShift = (shiftId: string) => {
      router.push(`/admin/shifts/edit/${shiftId}`)
    }

    // Persists the drawer form as a scheduled shift, then refreshes the rota grid.
    const saveShift = async () => {
      if (!selectedEmployee || !selectedDate) return

      setSaving(true)

      try {
        const { error } = await supabase
          .from("shifts")
          .insert({
            employee_id: selectedEmployee.id,
            shift_date: format(selectedDate, "yyyy-MM-dd"),
            start_time: newShift.start_time,
            end_time: newShift.end_time,
            break_minutes: newShift.break_minutes,
            shift_role: newShift.shift_role,
            notes: newShift.notes,
            status: "scheduled",
          })

        if (error) {
          console.error("Failed to create shift", error)
          alert(`Failed to create shift: ${error.message}`)
          return
        }

        await loadShifts()
        setShowCreateModal(false)
        setNewShift({
          start_time: "09:00",
          end_time: "17:00",
          break_minutes: 30,
          shift_role: "",
          notes: "",
        })
        setSelectedEmployee(null)
        setSelectedDate(null)
      } finally {
        setSaving(false)
      }
    }

    // The rota always uses Monday as the first day of the displayed week.
    const weekStart = startOfWeek(currentWeek, {
        weekStartsOn: 1,
    })

    const weekDays = Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index)
    )

  return (
    <main className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentWeek((prev) => subWeeks(prev, 1))}
            className="rounded-lg bg-amber-200 px-4 py-2 text-amber-900 hover:bg-amber-300"
          >
            Previous Week
          </button>

          <h1 className="text-xl font-semibold text-amber-900">
            Week of {format(weekStart, 'dd MMM yyyy')}
          </h1>

          <button
            type="button"
            onClick={() => setCurrentWeek((prev) => addWeeks(prev, 1))}
            className="rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
          >
            Next Week
          </button>
        </div>

        <div className="overflow-x-auto">

            <div className="grid grid-cols-8 gap-2 min-w-[800px]">

                {/* Header */}

                <div className="bg-amber-700 text-white font-bold rounded-lg p-3">
                Employee
                </div>

                {weekDays.map((day) => (
                <div
                    key={day.toISOString()}
                    className="bg-gradient-to-r from-[#8b5e3c] to-[#c49a6c] rounded-lg p-3 text-center text-white font-semibold"
                >
                    <div>{format(day, 'EEE')}</div>
                    <div>{format(day, 'dd')}</div>
                </div>
                ))}

                {/* Employee Rows */}

                {employees.map((employee) => (
                <div key={employee.id} className="contents">
                    <div
                    key={employee.id}
                    className="bg-white border rounded-lg p-3 font-medium"
                    >
                    {employee.first_name} {employee.last_name}
                    </div>

                  
                    {weekDays.map((day) => {
                    const dayShifts = shifts.filter(
                      (shift) => shift.employee_id === employee.id && shift.shift_date === format(day, "yyyy-MM-dd")
                    )

                    return (
                    <div onClick={() => {
                      if (dayShifts.length === 0) { openCreateShift(employee, day)}
                    }}
                     key={`${employee.id}-${day.toISOString()}`} className="border rounded-lg h-24 bg-white hover:bg-amber-50 p-2 overflow-auto">

                        {dayShifts.map((shift) => (
                            <div
                                key={shift.id} onClick={(e) => {e.stopPropagation()
                                  openEditShift(shift.id)}}
                                className="bg-amber-700 text-white rounded-md p-2 text-xs mb-1"
                            >
                                <div className="font-semibold">
                                {shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}
                                </div>

                                <div className="text-amber-100">
                                {shift.shift_role}
                                </div>
                            </div>
                            ))}

                    </div>
                    )})}
                </div>
                ))}

            </div>

        </div>
        {showCreateModal && (

          <div className="fixed inset-0 bg-black/40 flex justify-end z-50">

          <div className="w-full max-w-md bg-[#f1e7da] h-screen shadow-xl p-6 overflow-y-auto">

            <h2 className="text-2xl font-bold mb-6">Create Shift</h2>
            <div className="space-y-5">

              <div>
                <label htmlFor="employee-name" className="font-medium">Employee</label>
                <input id="employee-name" readOnly value={`${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`} className="w-full border rounded-lg p-2 bg-gray-100" />
              </div>

              <div>
                <label htmlFor="shift-date" className="font-medium">Date</label>
                <input id="shift-date" readOnly value={selectedDate ? format(selectedDate, 'EEEE dd MMMM yyyy') : ''} className="w-full border rounded-lg p-2 bg-gray-100" />
              </div>

              <div>
                <label htmlFor="start-time" className="font-medium">Start Time</label>
                <input id="start-time" type="time" value={newShift.start_time} onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} className="w-full border rounded-lg p-2" />
              </div>

              <div>
                <label htmlFor="end-time" className="font-medium">End Time</label>
                <input id="end-time" type="time" value={newShift.end_time} onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label htmlFor="break-minutes" className="font-medium">Break Minutes</label>
                <input id="break-minutes" type="number" value={newShift.break_minutes} onChange={(e) => {
                  const value = Number.parseInt(e.target.value, 10)
                  setNewShift({ ...newShift, break_minutes: Number.isNaN(value) ? 0 : value })
                }} className="w-full border rounded-lg p-2" aria-label="Break minutes for the shift" />
              </div>
              <div>
                <label htmlFor="shift-role" className="font-medium">Shift Role</label>
                <input id="shift-role" value={newShift.shift_role} onChange={(e) => setNewShift({ ...newShift, shift_role: e.target.value })} className="w-full border rounded-lg p-2" aria-label="Role for the shift" />
              </div>
              <div>
                <label htmlFor="shift-notes" className="font-medium">Notes</label>
                <textarea id="shift-notes" rows={4} value={newShift.notes} onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })} className="w-full border rounded-lg p-2" aria-label="Optional notes for the shift" />
              </div>
              <div className="flex justify-end gap-3 pt-5">
                <button onClick={() => setShowCreateModal(false)} className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                <button onClick={saveShift} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800" disabled={saving}>{saving ? 'Saving...' : 'Save Shift'}</button>
              </div>
            </div>

          </div>
        </div>
        )}

    </main>
  )
}
