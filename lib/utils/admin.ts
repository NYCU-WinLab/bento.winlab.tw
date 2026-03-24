import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from './admin-shared'

export { checkIsAdmin }

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

    return checkIsAdmin(profile)
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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('roles')
    .eq('id', user.id)
    .single()

  if (!checkIsAdmin(profile)) {
    throw new Error('Forbidden: Admin access required')
  }

  return { user, supabase }
}
