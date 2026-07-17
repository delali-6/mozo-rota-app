'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { BriefcaseBusiness, } from 'lucide-react'
import {
    House,
    Users,
    Calendar,
    CalendarHeart,
    Plus,
    Bell,
    Briefcase,
    Menu,
    Megaphone,
    LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMobileBottomNavVisibility } from '@/lib/useMobileBottomNavVisibility'

// Manager portal shell with persistent admin navigation and Supabase sign-out.
export default function AdminLayout({ children, }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const mobileNavVisible = useMobileBottomNavVisibility(pathname)
    const moreMenuRef = useRef<HTMLDetailsElement>(null)

    const primaryLinks = [
        { name: 'Dashboard', href: '/admin', icon: House },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Rota', href: '/admin/rota', icon: Calendar },
        { name: 'Shifts', href: '/admin/shifts', icon: Plus },
    ]

    const moreLinks = [
        { name: 'Open Shifts', href: '/admin/open-shifts', icon: BriefcaseBusiness },
        { name: 'Holidays', href: '/admin/holiday-requests', icon: CalendarHeart },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Policies', href: '/admin/policies', icon: Briefcase },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    ]

    const menuActive = moreLinks.some((link) => pathname === link.href)

    useEffect(() => {
        moreMenuRef.current?.removeAttribute('open')
    }, [pathname])

    const closeMoreMenu = () => {
        moreMenuRef.current?.removeAttribute('open')
    }

    // Ends the manager session and sends them back to the shared login page.
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }   

    return (
        <div className="mozo-admin-shell">
            <aside className="mozo-admin-sidebar hidden md:block">
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

                    <h1 className="text-xl font-bold text-[#C49A6C] sm:text-2xl">Mozo Rota Admin</h1>

                    <p className="mb-4 text-sm text-[#E7DCCF] sm:text-base">
                        Manager Portal
                    </p>
                </div>

                <nav className="space-y-2 md:space-y-2">
                    {[...primaryLinks, ...moreLinks].map((link) => {
                        const Icon = link.icon
                        const active = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                className={`mozo-admin-link ${active ? 'bg-[#6F4E37] text-white' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{link.name}</span>
                            </Link>
                        )
                    })}

                    <button onClick={handleLogout} className="mozo-admin-link w-full text-left">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <main className="mozo-admin-main pb-32 md:pb-6">
                {children}
            </main>

            <nav
                id="mobile-navigation-admin"
                aria-label="Admin mobile navigation"
                className={`fixed inset-x-2 bottom-2 z-50 mx-auto w-[min(30rem,calc(100%-1rem))] rounded-2xl border border-[#E5DCCF] bg-white/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_16px_40px_rgba(90,58,34,0.18)] backdrop-blur transition-all duration-300 md:hidden ${
                    mobileNavVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
                }`}
            >
                <div className="grid grid-cols-5 items-center gap-1">
                    {primaryLinks.map((link) => {
                        const Icon = link.icon
                        const active = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                className={`relative flex h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl text-[0.64rem] font-semibold leading-none transition sm:h-14 sm:text-[0.68rem]
                                ${
                                    active
                                        ? 'bg-[#6F4E37] text-white'
                                        : 'text-[#7A6A61] hover:bg-[#F1E7DA]'
                                }`}
                            >
                                <Icon
                                    size={20}
                                    className={active ? 'text-white' : 'text-[#8B5E3C]'}
                                    aria-hidden="true"
                                />
                                <span>{link.name === 'Dashboard' ? 'Home' : link.name}</span>
                            </Link>
                        )
                    })}

                    <details ref={moreMenuRef} className="group relative">
                        <summary
                            className={`flex h-14 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-semibold transition [&::-webkit-details-marker]:hidden
                            ${
                                menuActive
                                    ? 'bg-[#6F4E37] text-white'
                                    : 'text-[#7A6A61] hover:bg-[#F1E7DA]'
                            }`}
                            aria-label="More admin options"
                        >
                            <Menu
                                size={20}
                                className={menuActive ? 'text-white' : 'text-[#8B5E3C]'}
                                aria-hidden="true"
                            />
                            <span>More</span>
                        </summary>

                        <div className="absolute bottom-16 right-0 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-[#E5DCCF] bg-white shadow-[0_16px_40px_rgba(90,58,34,0.2)]">
                            {moreLinks.map((link) => {
                                const Icon = link.icon
                                const active = pathname === link.href

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMoreMenu}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition
                                        ${
                                            active
                                                ? 'bg-[#6F4E37] text-white'
                                                : 'text-[#6D5D54] hover:bg-[#F1E7DA]'
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={active ? 'text-white' : 'text-[#8B5E3C]'}
                                            aria-hidden="true"
                                        />
                                        {link.name}
                                    </Link>
                                )
                            })}

                            <button
                                type="button"
                                onClick={() => {
                                    closeMoreMenu()
                                    void handleLogout()
                                }}
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
    )
}
