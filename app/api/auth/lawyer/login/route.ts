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

  // Get lawyer_id from lawyers table
  const { data: lawyerData, error: lawyerError } = await adminSupabase
    .from('lawyers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (lawyerError || !lawyerData) {
    console.error('Error fetching lawyer data:', lawyerError)
    // Still return success, but log the error
  } else {
    // Create a session record
    const headers = req.headers
    const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const userAgent = headers.get('user-agent') || 'unknown'

    const { error: sessionError } = await adminSupabase
      .from('lawyer_sessions')
      .insert({
        lawyer_id: lawyerData.id,
        ip_address: ipAddress,
        user_agent: userAgent,
      })

    if (sessionError) {
      console.error('Error creating lawyer session:', sessionError)
      // Don't fail the login, just log the error
    }
  }

  return NextResponse.json({ user }, { status: 200 })
}

