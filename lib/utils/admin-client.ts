'use client'

import { createClient } from '@/lib/supabase/client'
import { checkIsAdmin } from './admin-shared'

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

    return checkIsAdmin(profile)
  } catch {
    return false
  }
}
