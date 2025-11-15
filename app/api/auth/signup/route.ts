import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { email, password, username } = await req.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const passwordHash = await hash(password, 10)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error || !data?.user?.id) {
    return NextResponse.json({ error: error?.message ?? 'Failed to sign up user.' }, { status: 400 })
  }

  await adminSupabase.from('users').insert({
    username,
    email,
    password_hash: passwordHash,
    auth_user_id: data.user.id,
  })

  return NextResponse.json({ user: data.user }, { status: 200 })
}