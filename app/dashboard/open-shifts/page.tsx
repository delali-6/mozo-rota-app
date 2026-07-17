'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useEmployee } from '../contexts/EmployeeContext'

type OpenShift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
  notes: string | null

  hasRequested?: boolean
}

export default function OpenShiftsPage() {
  const { employee } = useEmployee()

  const [shifts, setShifts] = useState<OpenShift[]>([])
  const [loading, setLoading] = useState(true)

  const loadOpenShifts = useCallback(async () => {
    if (!employee) {
      setLoading(false)
      return
    }

    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select(`
        id,
        shift_date,
        start_time,
        end_time,
        shift_role,
        notes
    `)
      .eq('is_open_shift', true)
      .gte('shift_date', today)
      .order('shift_date')
      .order('start_time')

    if (shiftsError) {
      console.error(shiftsError)
      setLoading(false)
      return
    }

    const { data: requests, error: requestsError } = await supabase
      .from('open_shift_requests')
      .select('shift_id')
      .eq('employee_id', employee.id)

    if (requestsError) {
      console.error(requestsError)
      setLoading(false)
      return
    }

    const requestedIds = new Set(
      requests?.map(r => r.shift_id)
    )

    setShifts(
      (shiftsData || []).map(shift => ({
        ...shift,
        hasRequested: requestedIds.has(shift.id),
      }))
    )

    setLoading(false)
  }, [employee])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadOpenShifts()
    }, 0)

    return () => window.clearTimeout(id)
  }, [loadOpenShifts])

  const requestShift = async (shiftId: string) => {
    if (!employee) return

    const { error } = await supabase
      .from('open_shift_requests')
      .insert({
        shift_id: shiftId,
        employee_id: employee.id,
        status: 'Pending',
      })

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    alert('Shift request sent! 🎉')

    await loadOpenShifts()
  }

  return (
    <main className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-[#4E342E]">
          Open Shifts
        </h1>

        <p className="text-gray-500 mt-2">
          Request extra shifts that are available.
        </p>
      </div>

      {loading ? (

        <p>Loading...</p>

      ) : shifts.length === 0 ? (

        <div className="mozo-card p-10 text-center text-gray-500">
          No open shifts available.
        </div>

      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {shifts.map((shift) => (

            <div
              key={shift.id}
              className="mozo-card p-6"
            >

              <h2 className="text-xl font-semibold text-[#4E342E]">
                {shift.shift_role}
              </h2>

              <p className="mt-4">
                <strong>Date:</strong>{' '}
                {new Date(shift.shift_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>

              <p className="mt-2">
                <strong>Time:</strong>{' '}
                {shift.start_time.slice(0,5)}
                {' - '}
                {shift.end_time.slice(0,5)}
              </p>

              {shift.notes && (
                <p className="mt-3 text-gray-500">
                  {shift.notes}
                </p>
              )}

              <button
                disabled={shift.hasRequested}
                onClick={() => requestShift(shift.id)}
                className={`mt-6 w-full rounded-lg py-3 font-semibold transition
                  ${
                    shift.hasRequested
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-[#6F4E37] hover:bg-[#5C4033] text-white'
                  }`}
                >
                {shift.hasRequested
                  ? '✓ Requested'
                  : 'Request Shift'}
              </button>

            </div>

          ))}

        </div>

      )}

    </main>
  )
}