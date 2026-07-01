'use client'

type Employee = {
  id: string
  first_name: string
  last_name: string
  job_title?: string
}

export type NewShift = {
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  break_minutes: number
  shift_role: string
  notes: string
  status: string
}

type Props = {
  employees: Employee[]
  newShift: NewShift
  setNewShift: React.Dispatch<React.SetStateAction<NewShift>>
  createShift: () => void
  saving: boolean
  formError: string | null
}

export default function ShiftForm({
  employees,
  newShift,
  setNewShift,
  createShift,
  saving,
  formError,
}: Props) {
  return (
    <div className="mozo-card p-6">

      <h2 className="text-xl font-semibold mb-6">
        Create New Shift
      </h2>

      {formError && (
        <div className="mb-5 rounded-lg bg-red-100 border border-red-300 p-3 text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Employee */}

        <div>
          <label className="mozo-field-label">
            Employee
          </label>

          <select
            className={`mozo-select ${newShift.employee_id ? 'text-[var(--mozo-black)]' : 'text-[var(--mozo-text-secondary)]'}`}
            value={newShift.employee_id}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                employee_id: e.target.value,
              })
            }
            aria-label="Select employee"
            required
          >
            <option value="" disabled hidden className="text-[var(--mozo-text-secondary)]">
              Select employee
            </option>

            {employees.map((employee) => (
              <option
                key={employee.id}
                value={employee.id}
                className="bg-white text-[var(--mozo-black)]"
              >
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}

        <div>
          <label className="mozo-field-label">
            Shift Date
          </label>

          <input
            type="date"
            className="mozo-input"
            value={newShift.shift_date}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                shift_date: e.target.value,
              })
            }
            title="Shift Date"
          />
        </div>

        {/* Start */}

        <div>
          <label className="mozo-field-label">
            Start Time
          </label>

          <input
            type="time"
            className="mozo-input"
            value={newShift.start_time}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                start_time: e.target.value,
              })
            }
            title="Start Time"
          />
        </div>

        {/* End */}

        <div>
          <label className="mozo-field-label">
            End Time
          </label>

          <input
            type="time"
            className="mozo-input"
            value={newShift.end_time}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                end_time: e.target.value,
              })
            }
            title="End Time"
          />
        </div>

        {/* Break */}

        <div>
          <label className="mozo-field-label">
            Break (minutes)
          </label>

          <input
            type="number"
            min={0}
            className="mozo-input"
            value={newShift.break_minutes}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                break_minutes: Number(e.target.value),
              })
            }
            title="Break Minutes"
          />
        </div>

        {/* Role */}

        <div>
          <label className="mozo-field-label">
            Shift Role
          </label>

          <input
            type="text"
            className="mozo-input"
            placeholder="Barista, Manager..."
            value={newShift.shift_role}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                shift_role: e.target.value,
              })
            }
          />
        </div>

        {/* Notes */}

        <div className="md:col-span-2">

          <label className="mozo-field-label">
            Notes
          </label>

          <textarea
            rows={4}
            className="mozo-textarea"
            value={newShift.notes}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                notes: e.target.value,
              })
            }
            title="Shift Notes"
          />

        </div>

      </div>

      <div className="flex justify-end mt-6">

        <button
          onClick={createShift}
          disabled={saving}
          className="mozo-btn mozo-btn-primary"
        >
          {saving ? 'Saving...' : 'Create Shift'}
        </button>

      </div>

    </div>
  )
}