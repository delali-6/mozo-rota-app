'use client'

import { useCallback, useEffect, useState } from 'react'
import { Flame, Clock3, CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEmployee } from '../contexts/EmployeeContext'

import Card from './Card'
import Carousel from './Carousel'
import SectionHeader from './SectionHeader'
import StatBadge from './StatBadge'

type OpenShift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
  hasRequested?: boolean
}

// Previews the next available open shifts employees can request from the dashboard.
export default function OpenShiftsCard() {

  const { employee } = useEmployee()
  const [shifts, setShifts] = useState<OpenShift[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingShiftId, setSubmittingShiftId] = useState<string | null>(null)

  // Loads a small set of upcoming open shifts for the carousel preview.
  const loadOpenShifts = useCallback(async () => {
    if (!employee) {
      setLoading(false)
      return
    }

    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('shifts')
      .select(`
        id,
        shift_date,
        start_time,
        end_time,
        shift_role
      `)
      .eq('is_open_shift', true)
      .gte('shift_date', today)
      .order('shift_date')
      .order('start_time')
      .limit(4)

    if (error) {
      console.error(error)
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
      (data || []).map((shift) => ({
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

    setSubmittingShiftId(shiftId)

    const { error } = await supabase
      .from('open_shift_requests')
      .insert({
        shift_id: shiftId,
        employee_id: employee.id,
        status: 'Pending',
      })

    setSubmittingShiftId(null)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setShifts((current) =>
      current.map((shift) =>
        shift.id === shiftId ? { ...shift, hasRequested: true } : shift
      )
    )
  }

  return (

    <Card>

      <SectionHeader
        title="Open Shifts"
        icon={<Flame className="text-orange-500" size={22} />}
        actionText="View All →"
        actionHref="/dashboard/open-shifts"
      />

      {loading ? (

        <p className="text-gray-500">
          Loading open shifts...
        </p>

      ) : shifts.length === 0 ? (

        <div className="text-center py-8">

          <p className="text-gray-500">
            No open shifts available.
          </p>

        </div>

      ) : (

        <Carousel>

          {shifts.map((shift) => (

            <div
              key={shift.id}
              className="min-w-full"
            >

              <div className="border rounded-2xl p-6 bg-[#FBF8F5]">

                <div className="flex items-center gap-2 text-[#4E342E]">

                  <CalendarDays size={18} />

                  <h3 className="font-bold text-lg">

                    {new Date(
                      shift.shift_date
                    ).toLocaleDateString(
                      'en-GB',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      }
                    )}

                  </h3>

                </div>

                <div className="flex items-center gap-2 mt-5">

                  <Clock3 size={18} />

                  <span className="text-lg">

                    {shift.start_time.slice(0,5)}

                    {' - '}

                    {shift.end_time.slice(0,5)}

                  </span>

                </div>

                <div className="mt-6">

                  <StatBadge>

                    ☕ {shift.shift_role}

                  </StatBadge>

                </div>

                <button
                  type="button"
                  disabled={shift.hasRequested || submittingShiftId === shift.id}
                  onClick={() => requestShift(shift.id)}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 transition ${
                    shift.hasRequested
                      ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                      : submittingShiftId === shift.id
                        ? 'cursor-wait bg-[#A1887F] text-white'
                        : 'bg-[#6F4E37] text-white hover:bg-[#5D4037]'
                  }`}
                >
                  {shift.hasRequested
                    ? 'Requested'
                    : submittingShiftId === shift.id
                      ? 'Requesting...'
                      : 'Request Shift'}
                </button>

              </div>

            </div>

          ))}

        </Carousel>

      )}

    </Card>

  )

}
