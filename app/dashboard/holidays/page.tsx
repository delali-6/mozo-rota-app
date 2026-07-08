// Employee holiday route placeholder. Future work can connect this to holiday requests and balances.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useEmployee } from '../contexts/EmployeeContext'
import { supabase } from '@/lib/supabase'

export default function HolidaysPage() {

  const { employee, loading } = useEmployee()

  useEffect(() => {
    console.log("Employee:", employee)
    console.log("Loading:", loading)
  }, [employee, loading])

  const [showModal, setShowModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(true)


  type HolidayRequest = {
    id: string
    start_date: string
    end_date: string
    days_requested: number
    reason: string | null
    status: string
    created_at: string
  }

  const [holidayRequests, setHolidayRequests] = useState<HolidayRequest[]>([])

  useEffect(() => {

    const nav = document.getElementById('mobile-navigation')

    console.log(nav)

    if (!nav) return

    if (showModal) {
        nav.style.display = 'none'
    } else {
        nav.style.display = 'block'
    }

    return () => {
        nav.style.display = 'block'
    }

}, [showModal])

    
const loadHolidayRequests = useCallback(async () => {
  console.log("========== LOADING HOLIDAYS ==========")
  console.log("Employee:", employee)

  if (!employee) {
    console.log("No employee found")
    return
  }

  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .eq("employee_id", employee.id)
    .order("created_at", { ascending: false })

  console.log("Returned holidays:", data)

  if (error) {
    console.error(error)
    return
  }

  setHolidayRequests(data || [])
}, [employee])

  useEffect(() => {
    if (!employee) return

    loadHolidayRequests()
  }, [employee, loadHolidayRequests])


  const submitHolidayRequest = async () => {

    if (!employee) return

    if (!startDate || !endDate) {

        alert('Please select both dates.')

        return

    }

    setSaving(true)

    const start = new Date(startDate)

    const end = new Date(endDate)

    const daysRequested =
        Math.floor(
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1

    const { error } = await supabase

        .from('holidays')

        .insert({

            employee_id: employee.id,

            start_date: startDate,

            end_date: endDate,

            days_requested: daysRequested,

            reason: reason,

            status: 'Pending'

        })

    setSaving(false)

    if (error) {

        console.error(error)

        alert(error.message)

        return

    }

    alert('Holiday request submitted! 🎉')
    await loadHolidayRequests()

    setShowModal(false)

    setStartDate('')

    setEndDate('')

    setReason('')

}

  return (

    <main className="space-y-8">

      {/* Page Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-[#4E342E]">

            🏖 My Holidays

          </h1>

          <p className="text-gray-500 mt-2">

            Manage your holiday requests.

          </p>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mozo-btn mozo-btn-primary flex items-center gap-2"
        >

          <Plus size={18} />

          Request Holiday

        </button>

      </div>

      {/* Holiday Balance */}

      <div className="mozo-card p-6">

        <h2 className="text-xl font-semibold text-[#4E342E]">

          Holiday Balance

        </h2>

        <p className="text-5xl font-bold text-[#6F4E37] mt-4">

          28

        </p>

        <p className="text-gray-500">

          Days Remaining

        </p>

      </div>

      {/* Request History */}

      <div className="mozo-card p-6">

        <h2 className="text-xl font-semibold text-[#4E342E] mb-4">

          Holiday Requests

        </h2>

        {holidayRequests.length === 0 ? (

    <p className="text-gray-500">

        You haven&apos;t submitted any holiday requests yet.

    </p>

    ) : (

        <div className="space-y-4">

            {holidayRequests.map((holiday) => (

                <div
                    key={holiday.id}
                    className="rounded-xl border border-[#E7D8CC] p-4"
                >

                    <div className="flex items-center justify-between">

                        <h3 className="font-semibold">

                            {new Date(holiday.start_date).toLocaleDateString('en-GB')}

                            {' → '}

                            {new Date(holiday.end_date).toLocaleDateString('en-GB')}

                        </h3>

                        <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold
                            ${
                                holiday.status === 'Approved'
                                    ? 'bg-green-100 text-green-700'
                                    : holiday.status === 'Declined'
                                    ? 'bg-red-100 text-red-700'
                                    : holiday.status === 'Cancelled'
                                    ? 'bg-gray-200 text-gray-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >

                            {holiday.status}

                        </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">

                        {holiday.days_requested} day(s)

                    </p>

                    {holiday.reason && (

                        <p className="mt-2 text-gray-600">

                            {holiday.reason}

                        </p>

                    )}

                </div>

            ))}

        </div>

    )}

      </div>

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

            <h2 className="text-2xl font-bold text-[#4E342E]">

              Request Holiday

            </h2>

            <div className="mt-6 space-y-5">

              <div>

                <label className="mozo-field-label">

                  Start Date

                </label>

                <input
                  type="date"
                  className="mozo-input"
                  aria-label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

              </div>

              <div>

                <label className="mozo-field-label">

                  End Date

                </label>

                <input
                  type="date"
                  className="mozo-input"
                  aria-label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

              </div>

              <div>

                <label className="mozo-field-label">

                  Reason

                </label>

                <textarea
                  rows={4}
                  className="mozo-textarea"
                  placeholder="Optional..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() => setShowModal(false)}
                className="mozo-btn border"
              >

                Cancel

              </button>

              <button
                className="mozo-btn mozo-btn-primary"
                onClick={submitHolidayRequest}
                disabled={saving}
              >
                {saving
                  ? 'Submitting...'
                  : 'Submit Request'
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </main>

  )

}
