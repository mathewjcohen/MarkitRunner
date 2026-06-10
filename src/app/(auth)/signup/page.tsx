'use client'

import { signUp } from '@/actions/auth'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Start your 90-day trial</h1>
        <p className="text-sm text-gray-500 mb-6">No credit card required.</p>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            minLength={8}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Create account
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Already have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
