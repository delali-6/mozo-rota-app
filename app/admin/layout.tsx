'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    PlusSquare,
    Bell,
    FileText,
    LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children, }: { children: React.ReactNode }) {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }   

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">
                        Mozo Rota Admin
                    </h1>

                    <p className="mb-4 text-gray-400">
                        Manager Portal
                    </p>
                </div>

                <nav className="space-y-2">
                    <Link href="/admin" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/admin/employees" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <Users size={20} />
                        <span>Employees</span>
                    </Link>

                    <Link href="/admin/rota" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <CalendarDays size={20} />
                        <span>Weekly Rota</span>
                    </Link>

                    <Link href="/admin/shifts" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <PlusSquare size={20} />
                        <span>Shifts</span>
                    </Link>

                    <Link href="/admin/announcements" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <Bell size={20} />
                        <span>Announcements</span>
                    </Link>

                    <Link href="/admin/policies" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <FileText size={20} />
                        <span>Policies</span>
                    </Link>

                    <Link href="/admin/notifications" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <Bell size={20} />
                        <span>Notifications</span>
                    </Link>

                    <button onClick={handleLogout} className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main content area */}
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}