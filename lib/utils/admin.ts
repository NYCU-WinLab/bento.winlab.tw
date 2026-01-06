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
