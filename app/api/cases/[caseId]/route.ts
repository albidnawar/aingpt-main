import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function DELETE(
  req: Request,
  { params }: { params: { caseId: string } },
) {
  console.log('DELETE request received for case:', params.caseId)
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

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required.' }, { status: 400 })
    }

    // Convert caseId to number (database uses BIGINT)
    const caseIdNum = parseInt(caseId, 10)
    if (isNaN(caseIdNum)) {
      return NextResponse.json({ error: 'Invalid case ID format.' }, { status: 400 })
    }

    // Verify user owns this case
    const { data: caseData, error: caseError } = await adminSupabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseIdNum)
      .maybeSingle()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      return NextResponse.json({ error: `Failed to fetch case: ${caseError.message}` }, { status: 500 })
    }

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
    }

    if (caseData.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this case.' }, { status: 403 })
    }

    // Get all documents for this case to delete from storage and database
    const { data: documentsData, error: documentError } = await adminSupabase
      .from('case_documents')
      .select('document_path')
      .eq('case_id', caseIdNum)

    if (!documentError && documentsData && documentsData.length > 0) {
      // Delete files from Supabase Storage
      const filePaths = documentsData
        .map((doc) => doc.document_path)
        .filter((path): path is string => path !== null && path !== undefined)

      if (filePaths.length > 0) {
        // File paths are stored as "user_id/timestamp-filename" format
        // Use them directly for storage deletion
        const { error: storageError } = await adminSupabase.storage
          .from('case-documents')
          .remove(filePaths)

        if (storageError) {
          console.error('Error deleting files from storage:', storageError)
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete case_documents records first (before deleting the case)
      // This is necessary because the foreign key doesn't have ON DELETE CASCADE
      const { error: deleteDocumentsError } = await adminSupabase
        .from('case_documents')
        .delete()
        .eq('case_id', caseIdNum)

      if (deleteDocumentsError) {
        console.error('Error deleting case documents:', deleteDocumentsError)
        return NextResponse.json({ error: `Failed to delete case documents: ${deleteDocumentsError.message}` }, { status: 500 })
      }
    }

    // Now delete the case (after documents are deleted)
    // Using adminSupabase to bypass RLS
    const { data: deletedData, error: deleteError } = await adminSupabase
      .from('cases')
      .delete()
      .eq('id', caseIdNum)
      .select()

    if (deleteError) {
      console.error('Error deleting case:', deleteError)
      console.error('Case ID (string):', caseId)
      console.error('Case ID (number):', caseIdNum)
      console.error('User ID:', userData.id)
      return NextResponse.json({ error: `Failed to delete case: ${deleteError.message}` }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      console.error('No rows deleted. Case ID (string):', caseId)
      console.error('Case ID (number):', caseIdNum)
      return NextResponse.json({ error: 'Case not found or already deleted.' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Case deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in delete case API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

