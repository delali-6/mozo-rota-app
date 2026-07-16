'use client'

import { useCallback, useEffect, useState } from 'react'
import { Flame, Clock3, CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEmployee } from '../contexts/EmployeeContext'

import Card from './Card'
import Carousel from './Carousel'
import SectionHeader from './SectionHeader'
import CardButton from './CardButton'
import StatBadge from './StatBadge'

type OpenShift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
}

// Previews the next available open shifts employees can request from the dashboard.
export default function OpenShiftsCard() {

  const { employee } = useEmployee()
  const [shifts, setShifts] = useState<OpenShift[]>([])
  const [loading, setLoading] = useState(true)

  // Loads a small set of upcoming open shifts for the carousel preview.
  const loadOpenShifts = useCallback(async () => {

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

      // Make the Request Shift button disabled if the employee has already requested that shift.
      if (employee?.id) {
        const { data: requests } = await supabase
          .from('open_shift_requests')
          .select('shift_id')
          .eq('employee_id', employee.id)

        const requestedIds = new Set(
          requests?.map(r => r.shift_id)
        )
      }

    if (error) {
      console.error(error)
    }

    setShifts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadOpenShifts()
    }, 0)

    return () => window.clearTimeout(id)
  }, [loadOpenShifts])

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

                <CardButton
                  href={`/dashboard/open-shifts/${shift.id}`}
                >

                  Request Shift

                </CardButton>

              </div>

            </div>

          ))}

        </Carousel>

      )}

    </Card>

  )

}
