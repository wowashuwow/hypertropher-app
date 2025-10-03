import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    // Update user profile with new picture URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile_picture_url: publicUrl,
        profile_picture_updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      // Try to clean up uploaded file
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName])
      
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ 
      url: publicUrl,
      fileName: data.path
    })

  } catch (error) {
    console.error('Profile picture upload error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(cookies())

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('profile_picture_url')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.profile_picture_url) {
      return NextResponse.json({ error: "No profile picture found" }, { status: 404 })
    }

    // Extract filename from URL
    const url = new URL(userProfile.profile_picture_url)
    const fileName = url.pathname.split('/').pop()

    if (!fileName) {
      return NextResponse.json({ error: "Invalid profile picture URL" }, { status: 400 })
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-pictures')
      .remove([fileName])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      // Continue with database update even if storage deletion fails
    }

    // Update user profile to remove picture URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile_picture_url: null,
        profile_picture_updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Profile picture delete error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
