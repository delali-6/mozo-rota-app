'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Shift = {
    id: string
    employee_id: string
    shift_date: string
    start_time: string
    end_time: string
    break_minutes: number
    shift_role: string
    notes: string
    status: string
    employees: { first_name: string; last_name: string } | null
}

type Employee = {
    id: string
    first_name: string
    last_name: string
    status: string
}

const emptyShift = {
    employee_id: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    break_minutes: 0,
    shift_role: '',
    notes: '',
}

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [newShift, setNewShift] = useState(emptyShift)
    const [showForm, setShowForm] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const loadEmployees = async () => {
        const { data, error } = await supabase.from('employees').select('*').eq('status', 'active')
        if (error) { console.error(error); return }
        setEmployees(data || [])
    }

    const loadShifts = async () => {
        const { data, error } = await supabase
            .from('shifts')
            .select(`
                *, employees!shifts_employee_id_fkey1 (first_name, last_name)`).order('shift_date', {ascending: true,
            })

        console.log('Loaded shifts:', data)
        console.log('Shift load error:', error)

        if (error) {
        console.error(error)
        return
        }

        setShifts(data || [])
    }

    useEffect(() => {
        loadEmployees()
        loadShifts()
    }, [])

    const createShift = async () => {
        setFormError(null)
        if (!newShift.employee_id || !newShift.shift_date || !newShift.start_time || !newShift.end_time) {
            setFormError('Please fill in all required fields.')
            return
        }

        setSaving(true)
        const { data:  user } = await supabase.auth.getUser()
        if (!user) {
            setFormError('You must be logged in to create a shift.')
            setSaving(false)
            return
        }

        const { error } = await supabase.from('shifts').insert({
            employee_id: newShift.employee_id,
            shift_date: newShift.shift_date,
            start_time: newShift.start_time,
            end_time: newShift.end_time,
            break_minutes: newShift.break_minutes,
            shift_role: newShift.shift_role,
            notes: newShift.notes,
            status: 'scheduled',
        })

        setSaving(false)

        if (error) {
            setFormError('Failed to create shift. Please try again.')
            console.error(error)
            return
        }

        setNewShift(emptyShift)
        setShowForm(false)
        loadShifts()
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Shift Management</h1>
                <button
                    onClick={() => { setShowForm((prev) => !prev); setFormError(null) }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Create Shift'}
                </button>
            </div>

            {/* Create Shift Form */}
            {showForm && (
                <div className="border rounded-xl p-6 bg-black shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-white">New Shift</h2>

                    {formError && (
                        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {formError}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Employee */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="employee_id" className="text-sm font-medium text-white">
                                Employee <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="employee_id"
                                value={newShift.employee_id}
                                onChange={(e) => setNewShift({ ...newShift, employee_id: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" className="text-black">Select employee…</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                    
                                ))}
                            </select>
                        </div>

                        {/* Shift Date */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="shift_date" className="text-sm font-medium text-white">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="shift_date"
                                value={newShift.shift_date}
                                onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Start Time */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="start_time" className="text-sm font-medium text-white">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="start_time"
                                value={newShift.start_time}
                                onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* End Time */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="end_time" className="text-sm font-medium text-white">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="end_time"
                                value={newShift.end_time}
                                onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Break Minutes */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="break_minutes" className="text-sm font-medium text-white">Break (minutes)</label>
                            <input
                                type="number"
                                id="break_minutes"
                                min={0}
                                value={newShift.break_minutes}
                                onChange={(e) => setNewShift({ ...newShift, break_minutes: parseInt(e.target.value) || 0 })}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Shift Role */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="shift_role" className="text-sm font-medium text-white">Role</label>
                            <input
                                type="text"
                                id="shift_role"
                                value={newShift.shift_role}
                                onChange={(e) => setNewShift({ ...newShift, shift_role: e.target.value })}
                                placeholder="e.g. Barista, Manager"
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Notes — full width */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label htmlFor="notes" className="text-sm font-medium text-white">Notes</label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={newShift.notes}
                                onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                                placeholder="Any additional notes…"
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={createShift}
                            disabled={saving}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : 'Save Shift'}
                        </button>
                    </div>
                </div>
            )}

            {/* Upcoming Shifts Table */}
            <div className="border rounded-xl bg-black shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg text-white font-semibold">Upcoming Shifts</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Start</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">End</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Break</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {shifts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                                        No shifts scheduled yet.
                                    </td>
                                </tr>
                            ) : (
                                shifts.map((shift) => (
                                    <tr key={shift.id} className="even:bg-slate-50 hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.shift_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">
                                            {shift.employees?.first_name} {shift.employees?.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.shift_role || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.start_time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.end_time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.break_minutes}m</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black capitalize">{shift.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm bg-black">{shift.notes || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}