'use client'

import Link from 'next/link'
import  Image  from 'next/image'
import { EmployeeProvider } from './contexts/EmployeeContext'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarHeart,
  Clock3,
  User,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.clear()
    router.push('/')
  }
    const links = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Shifts',
      href: '/dashboard/shifts',
      icon: CalendarDays,
    },
    {
      name: 'My Holidays',
      href: '/dashboard/holidays',
      icon: CalendarHeart,
    },
    {
      name: 'My Availability',
      href: '/dashboard/availability',
      icon: Clock3,
    },
    {
      name: 'My Profile',
      href: '/dashboard/profile',
      icon: User,
    },
  ]
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

  return (
    <EmployeeProvider>
    <div className="min-h-screen flex bg-[#F7F3EE]">

      {/* Sidebar */}

      <aside className="w-72 bg-[#4E342E] text-white flex flex-col">

        <div className="p-6 border-b border-[#6D4C41]">

          <Image src="/MozoLogo-v3.png" alt="Logo" width={400} height={200} />

          <h1 className="text-2xl font-bold text-[#C49A6C]">Employee Portal</h1>

        </div>

        <nav className="flex-1 mt-6">

          {links.map((link) => {

            const Icon = link.icon

            const active = pathname === link.href

            return (

              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-4 transition
                ${
                  active
                    ? 'bg-[#8D6E63]'
                    : 'hover:bg-[#6D4C41]'
                }`}
              >

                <Icon size={20} />

                {link.name}

              </Link>

            )
          })}

        </nav>

        <div className="p-6 border-t border-[#6D4C41]">

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-[#A1887F] hover:bg-[#8D6E63] py-3 rounded-lg transition"
          >
            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>

      {/* Main Content */}

      <main className="flex-1 p-10">

        {children}

      </main>

    </div>
    </EmployeeProvider>
  )
}