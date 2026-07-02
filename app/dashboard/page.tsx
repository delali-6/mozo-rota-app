'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth'
import { useEmployee } from './contexts/EmployeeContext'

export default function Dashboard() {
  const router = useRouter()
  const { employee, loading } = useEmployee()

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole()

      if (!role) {
        router.push('/login')
        return
      }

      if (role === 'manager') {
        router.push('/admin')
        return
      }
    }
    checkRole()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg mozo-subtitle">
          Loading...
        </p>
      </main>
    )
  }

const hour = new Date().getHours()

const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 14
    ? "Good Afternoon"
    : "Good Evening"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mozo-title">
        Employee Dashboard
      </h1>

      <p className="text-lg mozo-subtitle">
        ☕ {greeting}{employee ? `, ${employee.first_name}` : ''}!
      </p>
    </main>
  )
}