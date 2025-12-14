import { createClient } from '@/lib/supabase/server'

export async function isAdminServer(userId: string): Promise<boolean> {
  const supabase = await createClient()

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

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const admin = await isAdminServer(user.id)
  if (!admin) {
    throw new Error('Forbidden: Admin access required')
  }

  return { user, supabase }
}
