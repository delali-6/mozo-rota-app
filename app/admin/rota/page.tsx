'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { addWeeks, subWeeks,startOfWeek, addDays, format } from 'date-fns'

type Employee = {
  id: string
  first_name: string
  last_name: string
}

type Shift = {
  id: string
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  shift_role: string
}

export default function RotaPage() {

  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('first_name')

    if (error) {
      console.error(error)
      return
    }

    setEmployees(data || [])
  }
  loadEmployees()

  const loadShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('shift_date')

    if (error) {
      console.error(error)
      return
    }

    setShifts(data || [])
  }
     
    loadShifts()

    const weekStart = startOfWeek(currentWeek, {
        weekStartsOn: 1,
    })

    const weekDays = Array.from({ length: 7 }, (_, index) =>
        addDays(weekStart, index)
    )

  return (
    <main className="p-8">

        <div className="overflow-x-auto">

            <div className="grid grid-cols-8 gap-2 min-w-[800px]">

                {/* Header */}

                <div className="bg-amber-700 text-white font-bold rounded-lg p-3">
                Employee
                </div>

                {weekDays.map((day) => (
                <div
                    key={day.toISOString()}
                    className="bg-gradient-to-r from-[#8b5e3c] to-[#c49a6c] rounded-lg p-3 text-center text-white font-semibold"
                >
                    <div>{format(day, 'EEE')}</div>
                    <div>{format(day, 'dd')}</div>
                </div>
                ))}

                {/* Employee Rows */}

                {employees.map((employee) => (
                <div key={employee.id} className="contents">
                    <div
                    key={employee.id}
                    className="bg-white border rounded-lg p-3 font-medium"
                    >
                    {employee.first_name} {employee.last_name}
                    </div>

                    {weekDays.map((day) => (
                    <div key={`${employee.id}-${day.toISOString()}`} className="border rounded-lg h-24 bg-white hover:bg-amber-50 p-2 overflow-auto">

                        {shifts
                            .filter(
                            (shift) =>
                                shift.employee_id === employee.id &&
                                shift.shift_date === format(day, "yyyy-MM-dd")
                            )
                            .map((shift) => (
                            <div
                                key={shift.id}
                                className="bg-amber-700 text-white rounded-md p-2 text-xs mb-1"
                            >
                                <div className="font-semibold">
                                {shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}
                                </div>

                                <div className="text-amber-100">
                                {shift.shift_role}
                                </div>
                            </div>
                            ))}

                    </div>
                    ))}
                </div>
                ))}

            </div>

        </div>

    </main>
  )
}