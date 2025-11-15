import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { identifier, password } = await req.json()

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Both identifier and password are required.' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  let email = identifier

  if (!identifier.includes('@')) {
    const { data: lawyerRecord, error: lawyerLookupError } = await adminSupabase
      .from('lawyers')
      .select('email')
      .eq('lawyer_id', identifier)
      .maybeSingle()

    if (lawyerLookupError) {
      return NextResponse.json({ error: 'Unable to verify lawyer ID.' }, { status: 500 })
    }

    if (!lawyerRecord?.email) {
      return NextResponse.json({ error: 'No lawyer found with that ID.' }, { status: 400 })
    }

    email = lawyerRecord.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const user = data.user

  if (!user || user.user_metadata?.role !== 'lawyer') {
    return NextResponse.json(
      { error: 'This account is not registered as a lawyer. Please log in as a normal user.' },
      { status: 403 },
    )
  }

  return NextResponse.json({ user }, { status: 200 })
}

