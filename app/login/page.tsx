'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Login successful!')
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
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
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