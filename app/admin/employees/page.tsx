'use client'

import { useEffect, useState } from 'react'
import { Search, Pencil } from '@/lib/icons'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

// Manager employee directory with search, status filtering, editing, and soft-archive actions.
export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Loads the full employee directory once for client-side searching and filtering.
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

  // Search matches either the employee's full name or email address.
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase()
    return fullName.includes(search.toLowerCase()) || employee.email.toLowerCase().includes(search.toLowerCase())
  })

  // Status tabs apply after search so the table always reflects both controls.
  const visibleEmployees = filteredEmployees.filter((employee) => {
    if (statusFilter === 'all') return true

    return employee.status === statusFilter
  })

  // Soft-archives employees by setting status inactive rather than deleting staff records.
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

  // Reuses shared badge styles to make active/inactive state obvious in the table.
  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'mozo-badge mozo-badge-completed'
    return 'mozo-badge mozo-badge-cancelled'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mozo-title">Employees</h1>
          <p className="mozo-subtitle mt-1">{employees.length} staff members</p>
        </div>

        <button
          onClick={() => router.push('/admin/employees/new')}
          className="mozo-btn mozo-btn-primary"
        >
          + Add Employee
        </button>
      </div>

      <div className="mozo-card p-4 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mozo-text-secondary)]"
            size={18}
          />

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mozo-input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`mozo-btn ${statusFilter === 'all' ? 'mozo-btn-primary' : 'mozo-btn-outline'}`}
          >
            All
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`mozo-btn ${statusFilter === 'active' ? 'mozo-btn-primary' : 'mozo-btn-outline'}`}
          >
            Active
          </button>

          <button
            onClick={() => setStatusFilter('inactive')}
            className={`mozo-btn ${statusFilter === 'inactive' ? 'mozo-btn-primary' : 'mozo-btn-outline'}`}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="mozo-table-wrap">
        <table className="mozo-table min-w-full">
          <thead>
            <tr>
              <th>
                Full Name
              </th>

              <th>
                Email
              </th>

              <th>
                Telephone
              </th>

              <th className="text-right">
                £/hr
              </th>

              <th className="text-right">
                Status
              </th>

              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center mozo-subtitle"
                >
                  Loading employees...
                </td>
              </tr>
            ) : visibleEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center mozo-subtitle"
                >
                  No employees found for this filter.
                </td>
              </tr>
            ) : (
              visibleEmployees.map(
                (employee) => (
                  <tr
                    key={
                      employee.id
                    }
                    className="transition"
                  >
                    <td className="font-medium">
                      <button
                        onClick={() => router.push(`/admin/employees/${employee.id}`)}
                        className="hover:text-[var(--mozo-primary)] hover:underline"
                      >
                        {employee.first_name} {employee.last_name}
                      </button>
                    </td>

                    <td>
                      {employee.email}
                    </td>

                    <td>
                      {employee.telephone || '—'}
                    </td>

                    <td className="text-right font-medium">
                      £{employee.hourly_rate}
                    </td>

                    <td className="text-right">
                      <span className={getStatusBadgeClass(employee.status)}>
                        {employee.status}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/employees/${employee.id}/edit`)}
                          className="mozo-btn mozo-btn-outline inline-flex items-center gap-2 text-sm"
                        >
                          <Pencil size={16} /> Edit
                        </button>

                        <button
                          onClick={() => archiveEmployee(employee.id)}
                          className="mozo-btn mozo-btn-danger inline-flex items-center gap-2 text-sm"
                        >
                          Archive
                        </button>
                      </div>
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
