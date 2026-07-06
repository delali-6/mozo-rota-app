'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Handles employee and manager sign-in, then routes users to the correct portal for their role.
export default function LoginPage() {
  const [email, setEmail] =
    useState('')
  const [password, setPassword] =
    useState('')
  const [loading, setLoading] =
    useState(false)
  const [message, setMessage] =
    useState('')

  const router = useRouter()

  // Authenticates against Supabase, reads the linked employee role, and redirects after login.
  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      )

    if (authError) {
      console.log(
        'Login failed:',
        authError
      )

      setMessage(
        authError.message
      )

      setLoading(false)
      return
    }

    const user = authData.user

    const { data: employee } =
      await supabase.from('employees').select('role').eq('auth_user_id',user.id).maybeSingle()


    if (
      employee?.role === 'manager'
    )
      router.push('/admin')

    else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 border rounded-xl p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-center">
          Mozo Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full border p-3 rounded font-semibold"
        >
          {loading
            ? 'Logging in...'
            : 'Login'}
        </button>

        {message && (
          <p className="text-center">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
