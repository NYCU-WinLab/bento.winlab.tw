'use client'

import { useAuth } from '@/contexts/auth-context'
import { isAdmin } from '@/lib/utils/admin-client'
import { useEffect, useState } from 'react'

export function useAdminCheck() {
  const { user } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdminUser(false)
      setAdminLoading(false)
      return
    }

    let cancelled = false
    const check = async () => {
      try {
        const admin = await isAdmin(user.id)
        if (!cancelled) setIsAdminUser(admin)
      } catch {
        if (!cancelled) setIsAdminUser(false)
      } finally {
        if (!cancelled) setAdminLoading(false)
      }
    }
    check()

    return () => { cancelled = true }
  }, [user])

  return { isAdminUser, adminLoading, user }
}
