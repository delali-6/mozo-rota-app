'use client'

import Image from 'next/image'
import DashboardGreeting from './components/DashboardGreeting'
import NextShiftCard from './components/NextShiftCard'
import OpenShiftsCard from './components/OpenShiftsCard'
import NotificationsCard from './components/NotificationsCard'
import QuickActions from './components/QuickActions'

// Main employee dashboard overview. Cards are composed from smaller data-backed widgets.
export default function Dashboard() {

    return (

        <main className="space-y-8">

            <div className="flex justify-center md:hidden">

                <div className="w-full h-34 rounded-2xl bg-[#5a3a22] px-4 shadow-[0_12px_30px_rgba(90,58,34,0.22)] flex items-center justify-center">

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

            </div>

            <DashboardGreeting />

            <NextShiftCard />

            <OpenShiftsCard />

            <NotificationsCard />

            <QuickActions />

        </main>

    )

}
