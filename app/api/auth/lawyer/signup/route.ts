import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const {
    lawyerId,
    type,
    cellPhone,
    email,
    chamberAddress,
    yearsOfExperience,
    lawPracticingPlace,
    consultationFee,
    password,
  } = await req.json()

  if (!lawyerId || !email || !password || !type || !chamberAddress) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const { data: existingLawyer } = await adminSupabase
    .from('lawyers')
    .select('id')
    .or(`lawyer_id.eq.${lawyerId},email.eq.${email}`)
    .maybeSingle()

  if (existingLawyer) {
    return NextResponse.json({ error: 'A lawyer with this ID or email already exists. Please log in.' }, { status: 400 })
  }

  const passwordHash = await hash(password, 10)

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'lawyer',
      lawyer_id: lawyerId,
      phone: cellPhone,
      type,
    },
  })

  if (authError || !authData?.user) {
    return NextResponse.json({ error: authError?.message ?? 'Failed to create auth user.' }, { status: 400 })
  }

  const authUserId = authData.user.id

  const yearsExperienceValue = yearsOfExperience ? Number.parseInt(yearsOfExperience, 10) || null : null
  const consultationFeeValue = consultationFee ? Number.parseFloat(consultationFee) || null : null

  const { error: insertError } = await adminSupabase.from('lawyers').insert({
    lawyer_id: lawyerId,
    email,
    password_hash: passwordHash,
    phone: cellPhone,
    type,
    chamber_address: chamberAddress,
    law_practicing_place: lawPracticingPlace,
    years_experience: yearsExperienceValue,
    consultation_fee: consultationFeeValue,
    auth_user_id: authUserId,
  })

  if (insertError) {
    await adminSupabase.auth.admin.deleteUser(authUserId)
    return NextResponse.json({ error: 'Failed to save lawyer details.' }, { status: 500 })
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password })

  if (sessionError) {
    return NextResponse.json(
      {
        message: 'Signup successful. Please log in.',
        user: authData.user,
      },
      { status: 200 },
    )
  }

  return NextResponse.json(
    {
      message: 'Signup successful.',
      user: sessionData.user ?? authData.user,
    },
    { status: 200 },
  )
}

