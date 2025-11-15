import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
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

    // Get user_id from users table using auth_user_id
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id, token_balance')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const userId = userData.id
    const currentTokenBalance = userData.token_balance || 0

    // Check if user has enough tokens (100 tokens for filing)
    const filingCost = 100
    if (currentTokenBalance < filingCost) {
      return NextResponse.json(
        { error: `Insufficient tokens. You need ${filingCost} tokens to file a case. Current balance: ${currentTokenBalance}` },
        { status: 400 },
      )
    }

    // Parse form data
    const body = await req.json()
    const {
      caseNumber,
      caseType,
      thanaName,
      caseName,
      dharaNumber,
      caseTitle,
      registerDate,
      bpFormNo,
      casePersons,
      relationship,
      description,
      files, // Array of file paths from Supabase Storage
      isPublic, // Public/private status
    } = body

    // Validate required fields
    if (!caseNumber || !caseType) {
      return NextResponse.json({ error: 'Case number and case type are required.' }, { status: 400 })
    }

    // Insert case into database (without files - files go to case_documents table)
    const { data: caseData, error: caseError } = await adminSupabase
      .from('cases')
      .insert({
        user_id: userId,
        case_number: caseNumber,
        case_type: caseType,
        thana_name: thanaName || null,
        case_name_dhara: caseName || null,
        dhara_number: dharaNumber || null,
        case_title: caseTitle || null,
        register_date: registerDate || null,
        bp_form_no: bpFormNo || null,
        case_persons: casePersons || null,
        relationship: relationship || null,
        short_description: description || null,
        files: null, // Not using JSONB anymore
        is_public: isPublic === true, // Store true for public, false for private
      })
      .select()
      .single()

    if (caseError) {
      // Check if it's a duplicate case number error
      if (caseError.code === '23505') {
        return NextResponse.json({ error: 'A case with this case number already exists.' }, { status: 400 })
      }
      return NextResponse.json({ error: `Failed to create case: ${caseError.message}` }, { status: 500 })
    }

    // Insert file paths into case_documents table
    if (files && Array.isArray(files) && files.length > 0) {
      const documentRecords = files.map((filePath: string) => ({
        case_id: caseData.id,
        document_path: filePath,
      }))

      const { error: documentsError } = await adminSupabase
        .from('case_documents')
        .insert(documentRecords)

      if (documentsError) {
        console.error('Error inserting documents:', documentsError)
        // Don't fail the request, just log the error
      }
    }

    // Deduct tokens from user
    const newTokenBalance = currentTokenBalance - filingCost

    // Update user token balance
    const { error: updateBalanceError } = await adminSupabase
      .from('users')
      .update({ token_balance: newTokenBalance })
      .eq('id', userId)

    if (updateBalanceError) {
      // Rollback: delete the case if token update fails
      await adminSupabase.from('cases').delete().eq('id', caseData.id)
      return NextResponse.json({ error: 'Failed to process payment. Case not created.' }, { status: 500 })
    }

    // Record token transaction
    const { error: tokenTransactionError } = await adminSupabase.from('user_tokens').insert({
      user_id: userId,
      transaction_type: 'case_filing',
      amount: -filingCost,
    })

    if (tokenTransactionError) {
      console.error('Failed to record token transaction:', tokenTransactionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json(
      {
        message: 'Case filed successfully',
        case: caseData,
        newTokenBalance,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error filing case:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

