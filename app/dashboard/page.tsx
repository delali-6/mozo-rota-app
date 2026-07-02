'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useEmployee } from './contexts/EmployeeContext'
import Link from 'next/link'

type NextShift = {
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
}

export default function Dashboard() {
  const router = useRouter()
  const { employee, loading } = useEmployee()
  const [nextShift, setNextShift] = useState<NextShift | null>(null)
  const [loadingShift, setLoadingShift] = useState(true)

  const loadNextShift = useCallback(async () => {
    if (!employee) {
      setNextShift(null)
      setLoadingShift(false)
      return
    }

    setLoadingShift(true)

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('shifts')
      .select('shift_date, start_time, end_time, shift_role')
      .eq('employee_id', employee.id)
      .gte('shift_date', today)
      .order('shift_date')
      .order('start_time')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(error)
      setNextShift(null)
    } else {
      setNextShift(data)
    }

    setLoadingShift(false)
  }, [employee])

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole()

      if (!role) {
        router.push('/login')
        return
      }

      if (role === 'manager') {
        router.push('/admin')
        return
      }
    }
    checkRole()
  }, [router])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadNextShift()
    }, 0)

    return () => window.clearTimeout(id)
  }, [loadNextShift])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg mozo-subtitle">
          Loading...
        </p>
      </main>
    )
  }

const hour = new Date().getHours()

const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 14
    ? "Good Afternoon"
    : "Good Evening"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mozo-title">
        Employee Dashboard
      </h1>

      <p className="text-lg mozo-subtitle">
        ☕ {greeting}{employee ? `, ${employee.first_name}` : ''}!
      </p>
      <p className="text-gray-600 mt-2">
        Welcome back to Mozo Café
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

        {/* Cards go here */}
        <div className="bg-white rounded-2xl shadow-md border border-[#E7D8CC] p-6">
          {/* Card content */}
          <h2 className="text-lg font-semibold text-[#4E342E]">
            📅 Next Shift
          </h2>

          <div className="mt-5 text-gray-500">
            {loadingShift ? (
              <p className="mt-5 text-gray-500">Loading...</p>
            ) : nextShift ? (
              <>
                  <p className="mt-4 text-2xl font-bold text-[#4E342E]">
                      {new Date(nextShift.shift_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                      })}
                  </p>

                  <p className="text-lg mt-2">
                      {nextShift.start_time.slice(0,5)} - {nextShift.end_time.slice(0,5)}
                  </p>

                  <p className="text-amber-700 font-semibold mt-2">
                      ☕ {nextShift.shift_role}
                  </p>
              </>
            ) : (
              <p className="mt-5 text-gray-500">🎉 No upcoming shifts.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#E7D8CC] p-6">

          <h2 className="text-lg font-semibold text-[#4E342E]">
              🏖 Holiday Balance
          </h2>

          <p className="mt-5 text-3xl font-bold text-amber-700">
              {employee?.holiday_allowance}
          </p>

          <p className="text-gray-500">
              Annual Allowance
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#E7D8CC] p-6">

          <h2 className="text-lg font-semibold text-[#4E342E]">
              ⏰ Availability
          </h2>

          <p className="mt-5 text-gray-500">
              Coming soon...
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#E7D8CC] p-6">

            <h2 className="text-lg font-semibold text-[#4E342E]">
              📢 Announcements
            </h2>

            <p className="mt-5 text-gray-500">
              No announcements
            </p>
        </div>
      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-bold text-[#4E342E] mb-6">
            Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
            {/* Buttons */}
            <Link href="/dashboard/shifts"
              className="bg-[#6F4E37] hover:bg-[#5C4033] text-white px-6 py-3 rounded-xl">
                📅 View My Shifts
            </Link>

            <Link href="/dashboard/holidays"
              className="bg-[#8D6E63] hover:bg-[#795548] text-white px-6 py-3 rounded-xl">
                🏖 My Holidays
            </Link>

            <Link href="/dashboard/availability"
              className="bg-[#A1887F] hover:bg-[#8D6E63] text-white px-6 py-3 rounded-xl">
                ⏰ Availability
            </Link>
        </div>



      </div>
    </main>
  )
}