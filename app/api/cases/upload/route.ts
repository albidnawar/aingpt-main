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

    // Get user_id from users table
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 })
    }

    const bucketName = 'case-documents'
    const uploadedFilePaths: string[] = []

    // Upload each file to Supabase Storage
    for (const file of files) {
      // Create unique file path: user_id/timestamp-original-filename
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${userData.id}/${timestamp}-${sanitizedFileName}`
      
      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        // Continue with other files even if one fails
        continue
      }

      // Store just the path - this will be saved in case_documents table
      uploadedFilePaths.push(filePath)
    }

    if (uploadedFilePaths.length === 0) {
      return NextResponse.json({ error: 'Failed to upload files.' }, { status: 500 })
    }

    // Return just the file paths - these will be stored in case_documents table
    return NextResponse.json({ files: uploadedFilePaths }, { status: 200 })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

