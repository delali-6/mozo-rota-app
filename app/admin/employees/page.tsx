'use client'

import { useEffect, useState } from 'react'
import { Search, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {useRouter } from 'next/navigation';

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  telephone: string
  role: string
  job_title: string
  contract_hours: number
  holiday_allowance: number
  employment_type: string
  hourly_rate: number
  status: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {

    const fetchEmployees = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('employees').select('*').order('first_name', { ascending: true })
      if (error) {
        console.error('Error fetching employees:', error)
      } else {
        setEmployees(data || [])
      }
      setLoading(false)
    }

    fetchEmployees()
    }, [])


    const filteredEmployees = employees.filter((employee) => {
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase()
      return (fullName.includes(search.toLowerCase()) || employee.email.toLowerCase().includes(search.toLowerCase()))
    })

    const visibleEmployees = filteredEmployees.filter(
      (employee) => {
        if (
          statusFilter === 'all'
        )
        return true

        return (
          employee.status === statusFilter
        )
      }
    )

    const archiveEmployee = async (id: string) => {
      const confirmed = window.confirm('Are you sure you want to archive this employee?')
      if (!confirmed) return

      const { error } = await supabase.from('employees').update({ status: 'inactive' }).eq('id', id)
      if (error) {
        alert('Failed to archive employee. Please try again.')
        return
      }

        setEmployees((current) =>
          current.map((employee) =>
            employee.id === id ? { ...employee, status: 'inactive' } : employee
          )
        )
      }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">
          Employees
        </h1>

        <p className="text-gray-500">{
              employees.length
            } {' '} staff members
        </p>
      </div>

      <button onClick={() => router.push('/admin/employees/new')} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        + Add Employee
      </button>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg w-full"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setStatusFilter('all')}
          className="border px-3 py-2 rounded-lg">All
        </button>

        <button onClick={() => setStatusFilter('active')}
          className="border px-3 py-2 rounded-lg">Active
        </button>

        <button onClick={() => setStatusFilter('inactive')}
          className="border px-3 py-2 rounded-lg">Inactive
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b bg-black-100 text-left">
            <tr>
              <th className="p-4 text-white">
                Full Name
              </th>

              <th className="p-4 text-white">
                Email
              </th>

              <th className="p-4 text-white">
                Telephone
              </th>

              <th className="p-4 text-right text-white">
                £/hr
              </th>

              <th className="p-4 text-right text-white">
                Status
              </th>

              <th className="p-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center"
                >
                  Loading employees...
                </td>
              </tr>
            ) : (
              visibleEmployees.map(
                (employee) => (
                  <tr
                    key={
                      employee.id
                    }
                    className="border-b"
                  >
                    <td className="p-4 font-medium text-white">
                      <button onClick={() => router.push(`/admin/employees/${employee.id}`)}
                        className="hover:underline">
                      {
                        employee.first_name
                      }{' '}
                      {
                        employee.last_name
                      }
                      </button>
                    </td>

                    <td className="p-4 text-white">
                      {
                        employee.email
                      }
                    </td>

                    <td className="p-4 text-white">
                      {employee.telephone ||
                        '—'}
                    </td>

                    <td className="p-4 text-right font-medium text-white">
                      £
                      {
                        employee.hourly_rate
                      }
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          employee.status ===
                          'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {
                          employee.status
                        }
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button onClick={() => router.push(`/admin/employees/${employee.id}/edit`)}
                        className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50">
                        <Pencil size={16} /> Edit
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button onClick={() => archiveEmployee(employee.id)}
                        className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50">
                          <Pencil size={16}/> Archive
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}