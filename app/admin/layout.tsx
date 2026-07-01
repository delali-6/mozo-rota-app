'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    House,
    Users,
    Calendar,
    Plus,
    Bell,
    Briefcase,
    LogOut,
} from '@/lib/icons'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children, }: { children: React.ReactNode }) {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }   

    return (
        <div className="mozo-admin-shell">
            <aside className="mozo-admin-sidebar">
                <div className="mb-8">
                    <div className="mb-4 rounded-xl overflow-hidden">
                        <Image
                            src="/MozoLogo-v3.png"
                            alt="Mozo Coffee logo"
                            width={560}
                            height={270}
                            className="h-auto w-full object-cover"
                            priority
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-[#C49A6C]">Mozo Rota Admin</h1>

                    <p className="mb-4 text-[#E7DCCF]">
                        Manager Portal
                    </p>
                </div>

                <nav className="space-y-2">
                    <Link href="/admin" className="mozo-admin-link">
                        <House size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/admin/employees" className="mozo-admin-link">
                        <Users size={20} />
                        <span>Employees</span>
                    </Link>

                    <Link href="/admin/rota" className="mozo-admin-link">
                        <Calendar size={20} />
                        <span>Weekly Rota</span>
                    </Link>

                    <Link href="/admin/shifts" className="mozo-admin-link">
                        <Plus size={20} />
                        <span>Shifts</span>
                    </Link>

                    <Link href="/admin/announcements" className="mozo-admin-link">
                        <Bell size={20} />
                        <span>Announcements</span>
                    </Link>

                    <Link href="/admin/policies" className="mozo-admin-link">
                        <Briefcase size={20} />
                        <span>Policies</span>
                    </Link>

                    <Link href="/admin/notifications" className="mozo-admin-link">
                        <Bell size={20} />
                        <span>Notifications</span>
                    </Link>

                    <button onClick={handleLogout} className="mozo-admin-link w-full text-left">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <main className="mozo-admin-main">
                {children}
            </main>
        </div>
    )
}