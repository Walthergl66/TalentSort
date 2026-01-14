"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import AccessibilityChecker from '@/components/Accesibilidad/AccessibilityChecker'

export default function AccessibilityTestPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profileData || profileData.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            </div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <AccessibilityChecker />
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
