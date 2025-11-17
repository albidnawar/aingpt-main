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

    // Get lawyer_id from lawyers table
    const { data: lawyerData, error: lawyerError } = await adminSupabase
      .from('lawyers')
      .select('id, avatar_url')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()

    if (lawyerError || !lawyerData) {
      return NextResponse.json({ error: 'Lawyer not found.' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.' }, { status: 400 })
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit.' }, { status: 400 })
    }

    // Delete old avatar if it exists
    if (lawyerData.avatar_url) {
      // Extract file path from URL or use the stored path
      const oldPath = lawyerData.avatar_url.includes('/storage/v1/object/public/')
        ? lawyerData.avatar_url.split('/user-profile/')[1]
        : lawyerData.avatar_url

      if (oldPath) {
        await adminSupabase.storage
          .from('user-profile')
          .remove([oldPath])
      }
    }

    // Create unique file path: lawyer_id/avatar-timestamp.extension
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const sanitizedExtension = fileExtension.toLowerCase()
    const filePath = `lawyer-${lawyerData.id}/avatar-${timestamp}.${sanitizedExtension}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('user-profile')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true, // Replace if exists
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return NextResponse.json({ error: `Failed to upload avatar: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('user-profile')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update lawyer's avatar_url in database
    const { error: updateError } = await adminSupabase
      .from('lawyers')
      .update({ avatar_url: publicUrl })
      .eq('id', lawyerData.id)

    if (updateError) {
      console.error('Error updating avatar URL:', updateError)
      // Try to clean up uploaded file
      await adminSupabase.storage
        .from('user-profile')
        .remove([filePath])
      return NextResponse.json({ error: 'Failed to update avatar URL.' }, { status: 500 })
    }

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath 
    }, { status: 200 })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

