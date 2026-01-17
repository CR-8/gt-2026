"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Hide main navbar and footer on admin routes
    const navbar = document.querySelector('nav.main-navbar');
    const footer = document.querySelector('footer.main-footer');
    
    if (navbar) navbar.classList.add('hidden');
    if (footer) footer.classList.add('hidden');
    
    return () => {
      if (navbar) navbar.classList.remove('hidden');
      if (footer) footer.classList.remove('hidden');
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      // Check localStorage first (our custom auth)
      const storedUser = localStorage.getItem('admin_user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setLoading(false)
          return
        } catch (e) {
          localStorage.removeItem('admin_user')
        }
      }

      // Fallback to Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!adminUser) {
        router.push('/')
        return
      }

      setUser(adminUser)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-orange-500">Gantavya Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">{user?.email}</span>
              <button
                onClick={async () => {
                  localStorage.removeItem('admin_user')
                  await supabase.auth.signOut()
                  router.push('/')
                }}
                className="px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
