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
        <p className="text-lg">
          Loading...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">
        Employee Dashboard
      </h1>

      <button onClick={async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Log Out
      </button>
    </main>
  )
}