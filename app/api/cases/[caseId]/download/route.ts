import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function GET(
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
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required.' }, { status: 400 })
    }

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

    // Get all documents for this case
    const { data: documentsData, error: documentError } = await adminSupabase
      .from('case_documents')
      .select('document_path')
      .eq('case_id', caseId)

    if (documentError || !documentsData || documentsData.length === 0) {
      return NextResponse.json({ error: 'No files found for this case.' }, { status: 404 })
    }

    // Find the document that matches the fileName (could be full path or just filename)
    const documentData = documentsData.find((doc) => {
      const pathParts = doc.document_path.split('/')
      const pathFileName = pathParts[pathParts.length - 1]
      const cleanPathFileName = pathFileName.replace(/^\d+-/, '') // Remove timestamp prefix
      
      // Match by full path, filename with timestamp, or clean filename
      return (
        doc.document_path === fileName ||
        pathFileName === fileName ||
        cleanPathFileName === fileName
      )
    })

    if (!documentData) {
      return NextResponse.json({ error: 'File not found for this case.' }, { status: 404 })
    }

    const filePath = documentData.document_path
    const bucketName = 'case-documents'

    // Download file from Supabase Storage
    const { data: fileBlob, error: downloadError } = await adminSupabase.storage
      .from(bucketName)
      .download(filePath)

    if (downloadError || !fileBlob) {
      return NextResponse.json(
        {
          error: 'File not available in storage.',
          message: downloadError?.message || 'File download failed',
        },
        { status: 404 },
      )
    }

    // Extract filename from path for download
    const pathParts = filePath.split('/')
    const originalFileName = pathParts[pathParts.length - 1].replace(/^\d+-/, '') // Remove timestamp prefix

    // Return the file blob
    const arrayBuffer = await fileBlob.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${originalFileName}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

