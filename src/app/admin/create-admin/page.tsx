"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    accessCode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      setSuccess(true)
      setFormData({
        username: '',
        email: '',
        password: '',
        accessCode: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-black" />
      
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Admin Account</h1>
          <p className="text-neutral-400">Set up your first admin user</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300 text-sm">Error</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-300 text-sm">Success!</h3>
                <p className="text-sm text-green-200 mt-1">Admin account created successfully. You can now <a href="/login" className="underline">login</a>.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="bg-neutral-800 border-neutral-700 text-white h-11"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="bg-neutral-800 border-neutral-700 text-white h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="bg-neutral-800 border-neutral-700 text-white h-11"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-white">Access Code</Label>
              <Input
                id="accessCode"
                name="accessCode"
                type="text"
                value={formData.accessCode}
                onChange={handleChange}
                placeholder="Enter access code"
                className="bg-neutral-800 border-neutral-700 text-white h-11"
                required
              />
              <p className="text-xs text-neutral-500">This will be required at login along with username/password</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 h-11 text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <a href="/login" className="text-orange-500 hover:text-orange-400">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
