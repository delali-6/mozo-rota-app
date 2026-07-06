'use client'

import Link from 'next/link'

// Shortcut links for the most common employee dashboard tasks.
export default function QuickActions() {

    return (

        <div>

            <h2 className="text-2xl font-bold text-[#4E342E] mb-6">

                Quick Actions

            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <Link
                    href="/dashboard/shifts"
                    className="mozo-btn mozo-btn-primary text-center"
                >

                    📅 View My Shifts

                </Link>

                <Link
                    href="/dashboard/holidays"
                    className="mozo-btn text-center bg-[#8D6E63] text-white hover:bg-[#795548]"
                >

                    🏖 My Holidays

                </Link>

                <Link
                    href="/dashboard/availability"
                    className="mozo-btn text-center bg-[#A1887F] text-white hover:bg-[#8D6E63]"
                >

                    ⏰ Availability

                </Link>

            </div>

        </div>

    )

}
