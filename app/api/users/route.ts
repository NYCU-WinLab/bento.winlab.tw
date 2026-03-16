import { requireAdmin } from '@/lib/utils/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { supabase } = await requireAdmin()

    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, name')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profiles)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
