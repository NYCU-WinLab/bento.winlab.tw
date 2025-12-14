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
      .select('*')
      .eq('id', userId)
      .single()

    // Check both user_profiles.is_admin and auth.users.metadata.role
    return user.user_metadata?.role === 'admin' || profile?.is_admin === true
  } catch {
    // If user_profiles table doesn't exist or error, check metadata only
    return user.user_metadata?.role === 'admin'
  }
}

