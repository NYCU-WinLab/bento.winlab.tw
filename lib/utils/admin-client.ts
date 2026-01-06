'use client'

import { createClient } from '@/lib/supabase/client'

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || user.id !== userId) {
    return false
  }

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('id', userId)
      .single()

    // Check user_profiles.roles.bento array for "admin"
    if (profile?.roles && typeof profile.roles === 'object') {
      const bentoRoles = profile.roles.bento
      if (Array.isArray(bentoRoles)) {
        return bentoRoles.includes('admin')
      }
    }
    return false
  } catch {
    return false
  }
}

