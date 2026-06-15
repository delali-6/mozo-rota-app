'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {useRouter } from 'next/navigation';

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  telephone: string
  role: string
  employment_type: string
  hourly_rate: number
  status: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchEmployees = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('employees').select('*')
      if (error) {
        console.error('Error fetching employees:', error)
      } else {
        setEmployees(data)
      }
      setLoading(false)
    }

    fetchEmployees()
    }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">
          Employees
        </h1>

        <p className="text-gray-500 mb-8">
          Manage your Cafe employees here. You can view, add, edit, and remove employees as needed.
        </p>
      </div>

      <button onClick={() => router.push('/admin/employees/new')} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        + Add Employee
      </button>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div className="grid gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="border rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {employee.first_name} {employee.last_name} {employee.email} {employee.telephone}
                </h2>

                <p className="text-gray-500">
                  {employee.role}
                </p>

                <p className="text-sm text-gray-400">
                  {employee.employment_type}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  £{employee.hourly_rate}/hr
                </p>

                <p className="text-sm text-green-600">
                  {employee.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}