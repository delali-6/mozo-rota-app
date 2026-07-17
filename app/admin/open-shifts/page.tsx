'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'


type Applicant = {
  id: string
  first_name: string
  last_name: string
  email: string
  job_title: string | null
}

type OpenShiftRequest = {
  id: string
  status: string
  created_at: string
  message: string | null
  employees: Applicant
}

type OpenShift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  break_minutes: number
  shift_role: string
  status: string
  notes: string | null
  open_shift_requests: OpenShiftRequest[]
}


export default function OpenShiftsPage() {
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([])
  const [loading, setLoading] = useState(true)

  const loadOpenShifts = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('shifts')
      .select(`
        id,
        shift_date,
        start_time,
        end_time,
        break_minutes,
        shift_role,
        status,
        notes,
        open_shift_requests (
          id,
          status,
          created_at,
          message,
          employees (
            id,
            first_name,
            last_name,
            email,
            job_title
          )
        )
        )
      `)
      .eq('is_open_shift', true)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error loading open shifts:', error)
      setLoading(false)
      return
    }

    setOpenShifts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadOpenShifts()
    }, 0)

    return () => window.clearTimeout(id)
  }, [loadOpenShifts])

  return (
    <main className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-[#4E342E]">
          Open Shifts
        </h1>

        <p className="mt-2 text-gray-500">
          View open shifts and manage employee requests.
        </p>
      </div>

      {loading ? (

        <div className="mozo-card p-8 text-center">
          Loading open shifts...
        </div>

      ) : openShifts.length === 0 ? (

        <div className="mozo-card p-8 text-center text-gray-500">
          No open shifts currently available.
        </div>

      ) : (

        <div className="space-y-6">

          {openShifts.map((shift) => (

            <div
              key={shift.id}
              className="mozo-card p-6"
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-bold text-[#4E342E]">
                    {shift.shift_role || 'Open Shift'}
                  </h2>

                  <p className="mt-2 text-lg font-semibold">
                    {new Date(shift.shift_date).toLocaleDateString(
                      'en-GB',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>

                  <p className="mt-1 text-gray-600">
                    {shift.start_time.slice(0, 5)} -{' '}
                    {shift.end_time.slice(0, 5)}
                  </p>

                </div>

                <div className="rounded-lg bg-[#F3ECE5] px-4 py-2 text-center">

                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="font-semibold text-[#4E342E]">
                    {shift.status}
                  </p>

                </div>

              </div>

              {shift.notes && (

                <div className="mt-5 rounded-lg bg-[#FAF7F3] p-4">

                  <p className="text-sm font-semibold text-[#4E342E]">
                    Manager Notes
                  </p>

                  <p className="mt-1 text-gray-600">
                    {shift.notes}
                  </p>

                </div>

              )}

              {/* Applicants will be added here */}

              <div className="mt-6 border-t border-[#E7D8CC] pt-5">

                <div className="mt-6">

                    <h3 className="text-lg font-semibold text-[#4E342E]">
                      Applicants
                    </h3>

                    {shift.open_shift_requests.length === 0 ? (

                      <p className="mt-3 text-gray-500">
                        No employees have requested this shift yet.
                      </p>

                    ) : (

                      <div className="mt-4 space-y-3">

                        {shift.open_shift_requests.map((request) => (

                          <div
                            key={request.id}
                            className="flex items-center justify-between rounded-xl border border-[#E7D8CC] bg-[#FDFBF8] p-4"
                          >

                            <div>

                              <p className="font-semibold text-[#4E342E]">
                                {request.employees.first_name}{' '}
                                {request.employees.last_name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {request.employees.job_title || 'Employee'}
                              </p>

                              <p className="text-sm text-gray-500">
                                {request.employees.email}
                              </p>

                              {request.message && (
                                <p className="mt-2 text-sm italic text-gray-600">
                                  &ldquo;{request.message}&rdquo;
                                </p>
                              )}

                            </div>

                            <button
                              className="rounded-lg bg-[#6F4E37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5C4033]"
                            >
                              Approve
                            </button>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  )
}

  