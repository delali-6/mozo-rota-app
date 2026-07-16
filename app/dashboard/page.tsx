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

            <div className="flex justify-center md:justify-start">

                <div className="w-full max-w-[22rem] rounded-2xl bg-[#5a3a22] px-4 py-3 shadow-[0_12px_30px_rgba(90,58,34,0.22)] sm:max-w-[20rem] sm:px-5 md:max-w-[24rem]">

                    <Image
                        src="/MozoLogo-v3.png"
                        alt="Mozo"
                        width={520}
                        height={260}
                        priority
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px"
                        className="mx-auto h-auto w-full max-w-[16rem] sm:max-w-[14rem] md:mx-0 md:max-w-[18rem]"
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
