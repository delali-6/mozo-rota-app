'use client'

import Image from 'next/image'
import DashboardGreeting from './components/DashboardGreeting'
import NextShiftCard from './components/NextShiftCard'
import OpenShiftsCard from './components/OpenShiftsCard'
import NotificationsCard from './components/NotificationsCard'
import QuickActions from './components/QuickActions'

export default function Dashboard() {

    return (

        <main className="space-y-8">

            <div className="flex justify-center md:justify-start">

                <div className="rounded-2xl bg-[#5a3a22] px-18 py-4 shadow-[0_12px_30px_rgba(90,58,34,0.22)]">

                    <Image
                        src="/MozoLogo-v3.png"
                        alt="Mozo"
                        width={260}
                        height={130}
                        priority
                        className="h-auto w-70 sm:w-48 md:w-56"
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
