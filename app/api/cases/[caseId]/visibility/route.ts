import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function PATCH(
  req: Request,
  { params }: { params: { caseId: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Get user_id from users table
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const caseId = params.caseId
    const { isPublic } = await req.json()

    // Get case to verify ownership
    const { data: caseData, error: caseError } = await adminSupabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .maybeSingle()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
    }

    // Verify user owns this case
    if (caseData.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized access to this case.' }, { status: 403 })
    }

    // Update case visibility
    const { data: updatedCase, error: updateError } = await adminSupabase
      .from('cases')
      .update({ is_public: isPublic })
      .eq('id', caseId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: `Failed to update case: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: 'Case visibility updated successfully',
        case: updatedCase,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating case visibility:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

