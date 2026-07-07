'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
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
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
} from 'lucide-react'
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
  notes: string | null
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const compactWeekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const weekOfMonth = (weekStartDate: Date, monthDate: Date) => {
  const monthGridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const offsetDays = differenceInCalendarDays(weekStartDate, monthGridStart)

  return Math.floor(offsetDays / 7) + 1
}

const compactRoleLabel = (shiftRole: string) => {
  const sanitized = shiftRole.replace(/[^A-Za-z/ ]/g, ' ').trim()

  if (!sanitized) return 'SH'

  if (sanitized.includes('/')) {
    return sanitized.toUpperCase().slice(0, 3)
  }

  const parts = sanitized.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    const single = parts[0].toUpperCase()

    return single.length <= 3 ? single : single.slice(0, 2)
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const shiftPillClass = (shift: Shift) => {
  const status = (shift.status || '').toLowerCase()
  const role = (shift.shift_role || '').toLowerCase()

  if (status.includes('cancel') || status.includes('declined')) {
    return 'bg-[#EBC5BF] text-[#7B2D1F]'
  }

  if (status.includes('off') || role.includes('off') || role.includes('rest')) {
    return 'bg-[#8D8D91] text-white'
  }

  if (status.includes('leave') || role.includes('leave') || role.includes('holiday')) {
    return 'bg-[var(--mozo-beige)] text-[var(--mozo-primary-dark)]'
  }

  return 'bg-[var(--mozo-primary-light)] text-[var(--mozo-primary-dark)]'
}

// Employee schedule calendar. It fetches only the shifts inside the visible week or month.
export default function ShiftsPage() {
  const { employee, loading: employeeLoading } = useEmployee()
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')
  const [viewDate, setViewDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [selectedDayKey, setSelectedDayKey] = useState(format(new Date(), 'yyyy-MM-dd'))

  // The query range follows the selected view so Supabase only returns shifts currently on screen.
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

  // Calendar cells are derived from the visible range, including leading/trailing month days.
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: range.start,
        end: range.end,
      }),
    [range]
  )

  const mobileMonthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 }),
      }),
    [viewDate]
  )

  const mobileWeeks = useMemo(() => {
    const rows: Date[][] = []

    for (let index = 0; index < mobileMonthDays.length; index += 7) {
      rows.push(mobileMonthDays.slice(index, index + 7))
    }

    return rows
  }, [mobileMonthDays])

  const mobileVisibleWeeks = useMemo(() => {
    if (calendarMode === 'week') {
      return [days]
    }

    return mobileWeeks
  }, [calendarMode, days, mobileWeeks])

  const shiftsByDate = useMemo(() => {
    return shifts.reduce<Record<string, Shift[]>>((map, shift) => {
      if (!map[shift.shift_date]) {
        map[shift.shift_date] = []
      }

      map[shift.shift_date].push(shift)
      return map
    }, {})
  }, [shifts])

  useEffect(() => {
    if (employeeLoading) return

    if (!employee) return

    // Loads this employee's shifts for the active rota range whenever the view changes.
    const loadShifts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('shifts')
        .select('id, shift_date, start_time, end_time, shift_role, status, notes')
        .eq('employee_id', employee.id)
        .gte('shift_date', format(range.start, 'yyyy-MM-dd'))
        .lte('shift_date', format(range.end, 'yyyy-MM-dd'))
        .order('shift_date')
        .order('start_time')

      if (error) {
        console.error('Failed to load employee shifts:', error)
      }

      setShifts(data || [])
      setLastUpdatedAt(new Date())
      setLoading(false)
    }

    void loadShifts()
  }, [employee, employeeLoading, range, reloadToken])

  const calendarLoading = employeeLoading || loading
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const selectedDayShifts = shiftsByDate[selectedDayKey] || []
  const selectedDayDate = useMemo(() => {
    const [year, month, day] = selectedDayKey.split('-').map(Number)

    if (!year || !month || !day) return new Date()

    return new Date(year, month - 1, day)
  }, [selectedDayKey])

  const title =
    calendarMode === 'week'
      ? `${format(range.start, 'd MMM')} - ${format(range.end, 'd MMM yyyy')}`
      : format(viewDate, 'MMMM yyyy')

  // Moves the calendar backward by one week or one month depending on the active tab.
  const moveBack = () => {
    setViewDate((current) =>
      calendarMode === 'week' ? subWeeks(current, 1) : subMonths(current, 1)
    )
  }

  // Moves the calendar forward by one week or one month depending on the active tab.
  const moveForward = () => {
    setViewDate((current) =>
      calendarMode === 'week' ? addWeeks(current, 1) : addMonths(current, 1)
    )
  }

  // Groups fetched shifts into the matching calendar day cell.
  const getShiftsForDay = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd')

    return shiftsByDate[dayKey] || []
  }

  const formatShiftTime = (shift: Shift) =>
    `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`

  const selectDay = (day: Date) => {
    setSelectedDayKey(format(day, 'yyyy-MM-dd'))
  }

  return (
    <main className="space-y-6">
      <section className="-mx-4 bg-[#f3eee8] pb-26 md:hidden">
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--mozo-beige)] px-4 py-2 text-2xl leading-none font-bold tracking-tight text-[var(--mozo-primary-dark)]"
              aria-label="Jump to current month"
            >
              <span className="text-2xl leading-none">{format(viewDate, 'MMMM yyyy')}</span>
              <ChevronDown size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--mozo-border)] bg-[#ddd5c9] p-1">
            <div className="grid grid-cols-2 gap-1">
              {(['week', 'month'] as CalendarMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCalendarMode(mode)}
                  className={`rounded-xl px-3 py-2 text-base font-bold transition ${
                    calendarMode === mode
                      ? 'bg-[var(--mozo-primary-dark)] text-white'
                      : 'text-[var(--mozo-primary-dark)] hover:bg-[var(--mozo-beige)]'
                  }`}
                >
                  {mode === 'week' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--mozo-border)] bg-white px-2 py-1.5">
            <button
              type="button"
              onClick={moveBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--mozo-primary)] transition hover:bg-[var(--mozo-beige)]"
              aria-label="Previous period"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <p className="text-base font-bold text-[var(--mozo-primary-dark)]">{title}</p>

            <button
              type="button"
              onClick={moveForward}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--mozo-primary)] transition hover:bg-[var(--mozo-beige)]"
              aria-label="Next period"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-[2.6rem_repeat(7,minmax(0,1fr))] px-1 text-center">
            <span aria-hidden="true" />
            {compactWeekdayLabels.map((day, index) => (
              <span
                key={`${day}-${index}`}
                className={`text-sm font-bold ${index >= 5 ? 'text-[var(--mozo-primary)]' : 'text-[var(--mozo-primary-dark)]'}`}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[var(--mozo-primary-dark)]">
            <p className="text-[1rem] font-medium leading-tight">
              Last updated:{' '}
              {lastUpdatedAt
                ? `${format(lastUpdatedAt, 'dd/MM/yyyy')} at ${format(lastUpdatedAt, 'HH:mm')}`
                : '...'}
            </p>
            <button
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--mozo-beige)]"
              aria-label="Refresh shifts"
            >
              <RefreshCw size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-3 border-t border-[var(--mozo-border)] bg-[#f7f3ee] pb-36">
          {mobileVisibleWeeks.map((week) => (
            <div
              key={week[0].toISOString()}
              className="grid grid-cols-[2.6rem_repeat(7,minmax(0,1fr))] gap-x-1 border-b border-[var(--mozo-border)] px-1 py-2.5"
            >
              <p className="pt-1 text-center text-[1.25rem] font-semibold text-[var(--mozo-primary)]">
                W{weekOfMonth(week[0], viewDate)}
              </p>

              {week.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd')
                const isToday = dayKey === todayKey
                const isSelected = dayKey === selectedDayKey
                const muted = !isSameMonth(day, viewDate)
                const dayShifts = getShiftsForDay(day)

                return (
                  <button
                    type="button"
                    onClick={() => selectDay(day)}
                    aria-current={isSelected ? 'date' : undefined}
                    aria-label={`${format(day, 'EEEE d MMMM')}, ${dayShifts.length} shifts`}
                    key={day.toISOString()}
                    className={`min-h-[5.3rem] rounded-[0.65rem] p-1 text-left transition ${
                      isSelected
                        ? 'ring-2 ring-[var(--mozo-primary)] ring-offset-1'
                        : 'hover:bg-[var(--mozo-beige)]'
                    } ${
                      isToday ? 'bg-[#f5efe8]' : ''
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      <span
                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-[1.25rem] font-bold leading-none ${
                          isToday
                            ? 'bg-[var(--mozo-primary-dark)] text-white'
                            : muted
                              ? 'text-[#b0a39b]'
                              : 'text-[#1a1a1a]'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {calendarLoading ? (
                        <div className="h-5 rounded-md bg-[var(--mozo-beige)]" />
                      ) : dayShifts.length > 0 ? (
                        dayShifts.slice(0, 2).map((shift) => (
                          <span
                            key={shift.id}
                            className={`block rounded-[0.35rem] px-1 py-1 text-center text-[0.72rem] font-black leading-none tracking-tight ${shiftPillClass(shift)} ${
                              muted ? 'opacity-50' : ''
                            }`}
                          >
                            {compactRoleLabel(shift.shift_role || 'Shift')}
                          </span>
                        ))
                      ) : null}

                      {!calendarLoading && dayShifts.length > 2 && (
                        <span className="block text-center text-[0.66rem] font-bold text-[var(--mozo-text-secondary)]">
                          +{dayShifts.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <section className="px-4 pb-4 pt-3">
          <div className="rounded-2xl border border-[var(--mozo-border)] bg-white p-4 shadow-[0_8px_22px_rgba(90,58,34,0.1)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[var(--mozo-primary-dark)]">
                {format(selectedDayDate, 'EEEE d MMMM yyyy')}
              </h3>
              <span className="rounded-full bg-[var(--mozo-beige)] px-2.5 py-1 text-xs font-semibold text-[var(--mozo-primary-dark)]">
                {selectedDayShifts.length} {selectedDayShifts.length === 1 ? 'shift' : 'shifts'}
              </span>
            </div>

            {calendarLoading ? (
              <div className="h-16 rounded-xl bg-[var(--mozo-beige)]" />
            ) : selectedDayShifts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--mozo-border)] bg-[#faf7f2] p-3 text-sm text-[var(--mozo-text-secondary)]">
                No shift details for this day.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayShifts.map((shift) => (
                  <article
                    key={shift.id}
                    className="rounded-xl border border-[var(--mozo-border)] bg-[#faf7f2] p-3"
                  >
                    <p className="flex items-center gap-2 text-sm font-bold text-[var(--mozo-primary-dark)]">
                      <Clock3 size={15} aria-hidden="true" />
                      {formatShiftTime(shift)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--mozo-black)]">
                      Role: {shift.shift_role || 'Shift'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--mozo-text-secondary)]">
                      Notes: {shift.notes?.trim() ? shift.notes : 'No admin notes'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>

      <div className="hidden flex-col gap-4 lg:flex-row lg:items-end lg:justify-between md:flex">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#8B5E3C]">
            <CalendarDays size={18} aria-hidden="true" />
            Schedule
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#4E342E]">My Shifts</h1>
          <p className="mt-2 text-[#7A6A61]">View your rota by week or month.</p>
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

      <section className="hidden overflow-hidden rounded-2xl border border-[#E5DCCF] bg-white shadow-[0_12px_30px_rgba(90,58,34,0.08)] md:block">
        <div className="flex items-center justify-between border-b border-[#E5DCCF] px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={moveBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8B5E3C] transition hover:bg-[#F1E7DA]"
            aria-label="Previous rota period"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <h2 className="text-center text-lg font-bold text-[#4E342E] sm:text-xl">{title}</h2>

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
            const today = format(day, 'yyyy-MM-dd') === todayKey
            const selected = format(day, 'yyyy-MM-dd') === selectedDayKey

            return (
              <button
                type="button"
                onClick={() => selectDay(day)}
                aria-current={selected ? 'date' : undefined}
                key={day.toISOString()}
                className={`min-w-0 border-b border-r border-[#E5DCCF] p-2 text-left transition sm:p-3 ${
                  selected ? 'bg-[#f8efe5]' : ''
                } ${
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
                          {formatShiftTime(shift)}
                        </p>
                        <p className="mt-1 truncate text-[#7A6A61]">
                          {shift.shift_role || 'Shift'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#A89A91]">
                      No shift
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-[#E5DCCF] bg-[#FBF8F5] p-4">
          <div className="rounded-xl border border-[#E5DCCF] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[#4E342E]">
                {format(selectedDayDate, 'EEEE d MMMM yyyy')}
              </h3>
              <span className="rounded-full bg-[#F1E7DA] px-3 py-1 text-xs font-semibold text-[#5A3A22]">
                {selectedDayShifts.length} {selectedDayShifts.length === 1 ? 'shift' : 'shifts'}
              </span>
            </div>

            {calendarLoading ? (
              <div className="h-20 rounded-lg bg-[#F1E7DA]" />
            ) : selectedDayShifts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#E5DCCF] bg-[#FDFBF8] p-3 text-sm text-[#7A6A61]">
                No shift details for this day.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {selectedDayShifts.map((shift) => (
                  <article
                    key={shift.id}
                    className="rounded-lg border border-[#E5DCCF] bg-[#FDFBF8] p-3"
                  >
                    <p className="flex items-center gap-2 text-sm font-bold text-[#4E342E]">
                      <Clock3 size={15} aria-hidden="true" />
                      {formatShiftTime(shift)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#4E342E]">
                      Role: {shift.shift_role || 'Shift'}
                    </p>
                    <p className="mt-1 text-sm text-[#7A6A61]">
                      Notes: {shift.notes?.trim() ? shift.notes : 'No admin notes'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
