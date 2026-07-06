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
  Bell,
  BriefcaseBusiness,
  House,
  Inbox,
  Menu,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase';

// Employee portal shell: desktop sidebar, mobile bottom navigation, and shared employee context.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

    // Full desktop navigation keeps every employee route visible on larger screens.
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

  // Compact mobile tabs keep the highest-frequency employee actions within thumb reach.
  const bottomLinks = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: House,
    },
    {
      name: 'Schedule',
      href: '/dashboard/shifts',
      icon: CalendarDays,
    },
    {
      name: 'Offers',
      href: '/dashboard/open-shifts',
      icon: BriefcaseBusiness,
      hasBadge: true,
    },
    {
      name: 'Feed',
      href: '/dashboard/feed',
      icon: Bell,
      hasBadge: true,
    },
  ]

  // Lower-frequency mobile actions live behind the More menu to keep the nav short.
  const menuLinks = [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'Holidays',
      href: '/dashboard/holidays',
      icon: CalendarHeart,
      hasBadge: true,
    },
  ]

  // Planned items are shown disabled so the menu shape is ready before those routes exist.
  const inactiveMenuItems = [
    {
      name: 'Messages',
      icon: Inbox,
    },
    {
      name: 'Settings',
      icon: Settings,
    },
  ]

  const menuActive = menuLinks.some((link) => pathname === link.href)

    // Signs out from Supabase and returns the user to the login screen.
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

  return (
    <EmployeeProvider>
    <div className="min-h-screen flex bg-[#F7F3EE]">

      {/* Sidebar */}

      <aside className="hidden md:flex w-72 bg-[#4E342E] text-white flex-col">

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
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#A1887F] hover:bg-[#8D6E63] py-3 rounded-lg transition"
          >
            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>

      {/* Main Content */}

      <main className="flex-1 p-4 pb-28 sm:p-6 md:p-10 md:pb-10">

        {children}

      </main>

      <nav
        aria-label="Employee mobile navigation"
        className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-[#E5DCCF] bg-white/95 p-2 shadow-[0_16px_40px_rgba(90,58,34,0.18)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-5 items-center gap-1">
          {bottomLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-semibold transition
                ${
                  active
                    ? 'bg-[#6F4E37] text-white'
                    : 'text-[#7A6A61] hover:bg-[#F1E7DA]'
                }`}
              >
                <span className="relative inline-flex">
                  <Icon
                    size={20}
                    className={active ? 'text-white' : 'text-[#8B5E3C]'}
                    aria-hidden="true"
                  />
                  {link.hasBadge && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#BF3D24]" />
                  )}
                </span>
                <span>{link.name}</span>
              </Link>
            )
          })}

          <details className="group relative">
            <summary
              className={`flex h-14 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-semibold transition [&::-webkit-details-marker]:hidden
              ${
                menuActive
                  ? 'bg-[#6F4E37] text-white'
                  : 'text-[#7A6A61] hover:bg-[#F1E7DA]'
              }`}
              aria-label="More employee options"
            >
              <Menu
                size={20}
                className={menuActive ? 'text-white' : 'text-[#8B5E3C]'}
                aria-hidden="true"
              />
              <span>More</span>
            </summary>

            <div className="absolute bottom-16 right-0 w-56 overflow-hidden rounded-xl border border-[#E5DCCF] bg-white shadow-[0_16px_40px_rgba(90,58,34,0.2)]">
              {menuLinks.map((link) => {
                const Icon = link.icon
                const active = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold transition
                    ${
                      active
                        ? 'bg-[#6F4E37] text-white'
                        : 'text-[#6D5D54] hover:bg-[#F1E7DA]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={active ? 'text-white' : 'text-[#8B5E3C]'}
                        aria-hidden="true"
                      />
                      {link.name}
                    </span>
                    {link.hasBadge && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#BF3D24]" />
                    )}
                  </Link>
                )
              })}

              {inactiveMenuItems.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.name}
                    type="button"
                    disabled
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#9A8D86]"
                  >
                    <Icon size={18} className="text-[#8B5E3C]/60" aria-hidden="true" />
                    {item.name}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-[#E5DCCF] px-4 py-3 text-left text-sm font-semibold text-[#6D5D54] transition hover:bg-[#F1E7DA]"
              >
                <LogOut size={18} className="text-[#8B5E3C]" aria-hidden="true" />
                Logout
              </button>
            </div>
          </details>
        </div>
      </nav>

    </div>
    </EmployeeProvider>
  )
}
