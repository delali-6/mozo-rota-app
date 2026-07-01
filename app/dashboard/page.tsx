'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] =
    useState(true)

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

      setLoading(false)
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mozo-title">
        Employee Dashboard
      </h1>

      <button onClick={async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }} className="mozo-btn mozo-btn-primary">
        Log Out
      </button>
    </main>
  )
}