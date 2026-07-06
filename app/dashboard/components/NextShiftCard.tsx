'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEmployee } from '../contexts/EmployeeContext'

type Shift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
}

export default function NextShiftCard() {
  const { employee } = useEmployee()

  const [shift, setShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!employee) return

    loadShift()
  }, [employee])

  const loadShift = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', employee!.id)
      .gte('shift_date', today)
      .order('shift_date')
      .order('start_time')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(error)
    }

    setShift(data)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#E8DDD2] p-6 hover:shadow-lg transition">

      <div className="flex items-center gap-3 mb-5">

        <CalendarDays
          className="text-[#6F4E37]"
          size={24}
        />

        <h2 className="text-xl font-semibold text-[#4E342E]">
          Next Shift
        </h2>

      </div>

      {loading ? (

        <p className="text-gray-500">

          Loading...

        </p>

      ) : shift ? (

        <>

          <p className="text-lg font-semibold text-[#4E342E]">

            {new Date(shift.shift_date).toLocaleDateString(
              'en-GB',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }
            )}

          </p>

          <p className="text-3xl font-bold mt-2 text-[#6F4E37]">

            {shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}

          </p>

          <span className="inline-block mt-4 px-3 py-1 rounded-full bg-[#E8DDD2] text-[#4E342E] text-sm">

            {shift.shift_role}

          </span>

        </>

      ) : (

        <p className="text-gray-500">

          🎉 No upcoming shifts scheduled.

        </p>

      )}

    </div>
  )
}