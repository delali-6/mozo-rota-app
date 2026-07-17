'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type HolidayRequest = {
  id: string
  start_date: string
  end_date: string
  days_requested: number
  reason: string | null
  status: string

  employees: {
    first_name: string
    last_name: string
  } | null
}

export default function HolidayRequestsPage() {

  const [requests, setRequests] = useState<HolidayRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = useCallback(async () => {

    setLoading(true)

    const { data, error } = await supabase

      .from('holidays')

      .select(`
        *,
        employees (
          first_name,
          last_name
        )
      `)

      .order('created_at', { ascending: false })

    if (error) {

      console.error(error)
      setLoading(false)

    } else {

      setRequests(data || [])

    }

    setLoading(false)

  }, [])

    const updateStatus = async (
        id: string,
        status: 'Approved' | 'Declined'
    ) => {

    const { error } = await supabase

        .from('holidays')

        .update({
            status,
        })

        .eq('id', id)

    if (error) {

        console.error(error)

        alert(error.message)

        return

    }

        await loadRequests()

    }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadRequests()
    }, 0)

    return () => window.clearTimeout(id)
  }, [loadRequests])


  return (

    <main className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold text-[#4E342E]">

          Holiday Requests

        </h1>

        <p className="text-gray-500 mt-2">

          Review employee holiday requests.

        </p>

      </div>

      <div className="mozo-card overflow-hidden">

        <table className="w-full mozo-table">

          <thead className="bg-[#F3ECE5]">

            <tr>

              <th className="text-left p-4">
                Employee
              </th>

              <th className="text-left p-4">
                Dates
              </th>

              <th className="text-left p-4">
                Days
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-left p-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-8 text-center"
                >

                  Loading...

                </td>

              </tr>

            ) : requests.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >

                  No holiday requests found.

                </td>

              </tr>

            ) : (

              requests.map((request) => (

                <tr
                  key={request.id}
                  className="border-t"
                >

                  <td className="p-4 font-semibold">

                    {request.employees?.first_name}{' '}
                    {request.employees?.last_name}

                  </td>

                  <td className="p-4">

                    {new Date(request.start_date).toLocaleDateString('en-GB')}

                    {' - '}

                    {new Date(request.end_date).toLocaleDateString('en-GB')}

                  </td>

                  <td className="p-4">

                    {request.days_requested}

                  </td>

                  <td className="p-4">

                    {request.status}

                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">
                      {request.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(request.id, 'Approved')
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(request.id, 'Declined')
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Completed
                        </span>
                      )}
                    </div>

                  </td>
                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </main>

  )

}