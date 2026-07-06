'use client'

import Link from 'next/link'

export type Shift = {
  id: string
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  break_minutes: number
  shift_role: string
  notes: string
  status: string
  employees: {
    first_name: string
    last_name: string
  } | null
}

type Props = {
  shifts: Shift[]
  deleteShift: (id: string) => void
}

// Displays the manager shift list with edit/delete actions and status styling.
export default function ShiftTable({
  shifts,
  deleteShift,
}: Props) {
  // Maps backend shift status values onto the shared badge styles.
  const getStatusBadgeClass = (status: string) => {
    if (status === 'completed') return 'mozo-badge mozo-badge-completed'
    if (status === 'cancelled') return 'mozo-badge mozo-badge-cancelled'
    return 'mozo-badge mozo-badge-scheduled'
  }

  if (shifts.length === 0) {
    return (
      <div className="mozo-card text-center p-10">
        <p className="mozo-subtitle">
          No shifts have been scheduled yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mozo-table-wrap">

      <table className="mozo-table">

        <thead>

          <tr>

            <th className="px-6 py-3 text-left">
              Employee
            </th>

            <th className="px-6 py-3 text-left">
              Date
            </th>

            <th className="px-6 py-3 text-left">
              Start
            </th>

            <th className="px-6 py-3 text-left">
              End
            </th>

            <th className="px-6 py-3 text-left">
              Break
            </th>

            <th className="px-6 py-3 text-left">
              Role
            </th>

            <th className="px-6 py-3 text-left">
              Status
            </th>

            <th className="px-6 py-3 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {shifts.map((shift) => (

            <tr
              key={shift.id}
              className="transition"
            >

              <td>

                {shift.employees
                  ? `${shift.employees.first_name} ${shift.employees.last_name}`
                  : 'Unknown Employee'}

              </td>

              <td>
                {shift.shift_date}
              </td>

              <td>
                {shift.start_time}
              </td>

              <td>
                {shift.end_time}
              </td>

              <td>
                {shift.break_minutes} mins
              </td>

              <td>
                {shift.shift_role}
              </td>

              <td className="text-center">

                <span className={getStatusBadgeClass(shift.status)}>

                  {shift.status}

                </span>

              </td>

              <td className="text-center">

                <div className="flex justify-center gap-2">

                  <Link
                    href={`/admin/shifts/edit/${shift.id}`}
                  >
                    <button className="mozo-btn mozo-btn-outline text-sm px-3 py-1">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() =>
                      deleteShift(shift.id)
                    }
                    className="mozo-btn mozo-btn-danger text-sm px-3 py-1"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}
