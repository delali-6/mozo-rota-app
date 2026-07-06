'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEmployee } from '../contexts/EmployeeContext'

type CalendarMode = 'week' | 'month'

type Shift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
  status: string
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ShiftsPage() {
  const { employee, loading: employeeLoading } = useEmployee()
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week')
  const [viewDate, setViewDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)

  const range = useMemo(() => {
    if (calendarMode === 'week') {
      const start = startOfWeek(viewDate, { weekStartsOn: 1 })

      return {
        start,
        end: addDays(start, 6),
      }
    }

    return {
      start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 }),
    }
  }, [calendarMode, viewDate])

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: range.start,
        end: range.end,
      }),
    [range]
  )

  useEffect(() => {
    if (employeeLoading) return

    if (!employee) return

    const loadShifts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('shifts')
        .select('id, shift_date, start_time, end_time, shift_role, status')
        .eq('employee_id', employee.id)
        .gte('shift_date', format(range.start, 'yyyy-MM-dd'))
        .lte('shift_date', format(range.end, 'yyyy-MM-dd'))
        .order('shift_date')
        .order('start_time')

      if (error) {
        console.error('Failed to load employee shifts:', error)
      }

      setShifts(data || [])
      setLoading(false)
    }

    void loadShifts()
  }, [employee, employeeLoading, range])

  const calendarLoading = employeeLoading || loading

  const title =
    calendarMode === 'week'
      ? `${format(range.start, 'd MMM')} - ${format(range.end, 'd MMM yyyy')}`
      : format(viewDate, 'MMMM yyyy')

  const moveBack = () => {
    setViewDate((current) =>
      calendarMode === 'week' ? subWeeks(current, 1) : subMonths(current, 1)
    )
  }

  const moveForward = () => {
    setViewDate((current) =>
      calendarMode === 'week' ? addWeeks(current, 1) : addMonths(current, 1)
    )
  }

  const getShiftsForDay = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd')

    return shifts.filter((shift) => shift.shift_date === dayKey)
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#8B5E3C]">
            <CalendarDays size={18} aria-hidden="true" />
            Schedule
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#4E342E]">
            My Shifts
          </h1>
          <p className="mt-2 text-[#7A6A61]">
            View your rota by week or month.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#E5DCCF] bg-white p-1">
            {(['week', 'month'] as CalendarMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCalendarMode(mode)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  calendarMode === mode
                    ? 'bg-[#6F4E37] text-white'
                    : 'text-[#7A6A61] hover:bg-[#F1E7DA]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setViewDate(new Date())}
            className="rounded-xl border border-[#E5DCCF] bg-white px-4 py-2 text-sm font-semibold text-[#6F4E37] transition hover:bg-[#F1E7DA]"
          >
            Today
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E5DCCF] bg-white shadow-[0_12px_30px_rgba(90,58,34,0.08)]">
        <div className="flex items-center justify-between border-b border-[#E5DCCF] px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={moveBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8B5E3C] transition hover:bg-[#F1E7DA]"
            aria-label="Previous rota period"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <h2 className="text-center text-lg font-bold text-[#4E342E] sm:text-xl">
            {title}
          </h2>

          <button
            type="button"
            onClick={moveForward}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8B5E3C] transition hover:bg-[#F1E7DA]"
            aria-label="Next rota period"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-[#E5DCCF] bg-[#FBF8F5]">
          {weekdayLabels.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#7A6A61]"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className={`grid grid-cols-7 ${
            calendarMode === 'month' ? 'auto-rows-[8.5rem]' : 'auto-rows-[11rem]'
          }`}
        >
          {days.map((day) => {
            const dayShifts = getShiftsForDay(day)
            const muted = calendarMode === 'month' && !isSameMonth(day, viewDate)
            const today = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={day.toISOString()}
                className={`min-w-0 border-b border-r border-[#E5DCCF] p-2 sm:p-3 ${
                  muted ? 'bg-[#FBF8F5] text-[#A89A91]' : 'bg-white'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ${
                      today
                        ? 'bg-[#6F4E37] text-white'
                        : 'text-[#4E342E]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {calendarLoading ? (
                    <div className="h-8 rounded-lg bg-[#F1E7DA]" />
                  ) : dayShifts.length > 0 ? (
                    dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="rounded-lg bg-[#F1E7DA] p-2 text-xs text-[#4E342E]"
                      >
                        <p className="flex items-center gap-1 font-bold">
                          <Clock3 size={13} aria-hidden="true" />
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </p>
                        <p className="mt-1 truncate text-[#7A6A61]">
                          {shift.shift_role || 'Shift'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="hidden text-xs text-[#A89A91] sm:block">
                      No shift
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
