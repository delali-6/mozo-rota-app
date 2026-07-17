'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Repeat, CalendarHeart, BriefcaseBusiness } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type ShiftRow = {
    id: string
    shift_role: string | null
    start_time: string
    end_time: string
    employees:
        | {
              first_name: string | null
              last_name: string | null
          }
        | {
              first_name: string | null
              last_name: string | null
          }[]
        | null
}

type ShiftCardItem = {
    id: string
    employeeName: string
    role: string
    time: string
}

const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const formatShiftTime = (startTime: string, endTime: string) => {
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
}

const getEmployeeName = (employees: ShiftRow['employees']) => {
    const employee = Array.isArray(employees) ? employees[0] : employees

    if (!employee) {
        return 'Unassigned employee'
    }

    return [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'Unnamed employee'
}

export default function AdminPage() {
    const [todaysShifts, setTodaysShifts] = useState<ShiftCardItem[]>([])
    const [loadingShifts, setLoadingShifts] = useState(true)

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const dateLabel = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })

    useEffect(() => {
        const loadTodaysShifts = async () => {
            setLoadingShifts(true)

            const { data, error } = await supabase
                .from('shifts')
                .select(`
                    id,
                    shift_role,
                    start_time,
                    end_time,
                    employees!shifts_employee_id_fkey1 (first_name, last_name)
                `)
                .eq('shift_date', getLocalDateKey(new Date()))
                .not('employee_id', 'is', null)
                .neq('status', 'cancelled')
                .order('start_time', { ascending: true })

            if (error) {
                console.error('Failed to load today\'s shifts:', error)
                setTodaysShifts([])
                setLoadingShifts(false)
                return
            }

            const normalizedShifts = (data as ShiftRow[] | null)?.map((shift) => ({
                id: shift.id,
                employeeName: getEmployeeName(shift.employees),
                role: shift.shift_role?.trim() || 'Shift',
                time: formatShiftTime(shift.start_time, shift.end_time),
            }))

            setTodaysShifts(normalizedShifts || [])
            setLoadingShifts(false)
        }

        void loadTodaysShifts()
    }, [])

    const stats = useMemo(
        () => [
        { label: 'Staff On Shift', value: loadingShifts ? '...' : todaysShifts.length },
        { label: 'Pending Swaps', value: 2 },
        { label: 'Leave Requests', value: 1 },
        { label: 'Open Shifts', value: 3 },
    ],
        [loadingShifts, todaysShifts.length]
    )

    const attentionItems = [
        { label: '2 pending shift swaps', href: '/admin/rota', icon: Repeat },
        { label: '1 leave request awaiting review', href: '/admin/holiday-requests', icon: CalendarHeart },
        { label: '3 open shifts unfilled this week', href: '/admin/open-shifts', icon: BriefcaseBusiness },
    ]

    return (
        <div>
            {/* Mobile-only header: sidebar (with logo) is hidden below md, so
                this is the only place the logo appears on small screens. */}
            <div className="w-full h-34 rounded-2xl bg-[#5a3a22] px-4 shadow-[0_12px_30px_rgba(90,58,34,0.22)] flex items-center justify-center md:hidden">

                    <Image
                        src="/MozoLogo-v3.png"
                        alt="Mozo"
                        width={420}
                        height={220}
                        priority
                        sizes="100vw"
                        className="h-auto w-auto max-h-37 max-w-[20rem] object-contain"
                    />

                </div>

            <h1 className="mozo-title mb-2">
                {greeting}, Manager 👋
            </h1>
            <p className="mozo-subtitle mb-8">
                {dateLabel} — here&rsquo;s what&rsquo;s happening today.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="mozo-card p-5">
                        <h2 className="font-semibold text-sm">{stat.label}</h2>
                        <p className="text-3xl mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
                <div className="mozo-card p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-semibold">Today&rsquo;s Shifts</h2>
                        <span className="text-sm text-[#8B7E72]">
                            {loadingShifts ? 'Loading shifts...' : `${todaysShifts.length} on shift today`}
                        </span>
                    </div>

                    {loadingShifts ? (
                        <div className="mt-4 space-y-2">
                            <div className="h-10 rounded-xl bg-[#F4ECE4]" />
                            <div className="h-10 rounded-xl bg-[#F4ECE4]" />
                            <div className="h-10 rounded-xl bg-[#F4ECE4]" />
                        </div>
                    ) : todaysShifts.length === 0 ? (
                        <p className="mt-4 rounded-xl border border-dashed border-[#E5DCCF] bg-[#FBF8F5] px-4 py-5 text-sm text-[#8B7E72]">
                            No employees are scheduled for today.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {todaysShifts.map((shift) => (
                                <li
                                    key={shift.id}
                                    className="flex flex-col gap-2 rounded-xl border border-[#E5DCCF] bg-[#FBF8F5] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="font-medium text-[#4E342E]">
                                        {shift.employeeName} · {shift.role}
                                    </span>
                                    <span className="text-[#8B7E72]">{shift.time}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mozo-card p-5">
                    <h2 className="font-semibold mb-3">Needs Your Attention</h2>
                    <ul className="divide-y divide-[#E5DCCF]">
                        {attentionItems.map(({ label, href, icon: Icon }) => (
                            <li key={label}>
                                <Link
                                    href={href}
                                    className="flex items-center justify-between py-3 text-sm hover:text-[#6F4E37]"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon size={16} className="text-[#8B5E3C]" />
                                        {label}
                                    </span>
                                    <span>→</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}