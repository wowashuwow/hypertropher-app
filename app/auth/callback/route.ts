import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Handle email verification flow (token or token_hash parameter)
  // This is used for email+password signup email verification links
  if (token || tokenHash) {
    const verifyToken = token || tokenHash
    const verifyType = type || 'email'
    
    // Verify the email verification token
    const { error, data } = await supabase.auth.verifyOtp({
      token_hash: verifyToken,
      type: verifyType as 'email' | 'signup' | 'recovery' | 'invite',
    })
    
    if (error) {
      console.error('Email verification error:', error)
      // If token expired or invalid, redirect with error
      return NextResponse.redirect(`${requestUrl.origin}/signup?error=verification_failed`)
    }

    // Check if user has completed profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id, city')
        .eq('id', user.id)
        .single()
      
      if (!profile || !profile.city) {
        // New user needs to complete profile
        // Invite code should be in user_metadata for email signups
        return NextResponse.redirect(`${requestUrl.origin}/complete-profile`)
      }
    }
  } else {
    // No token - invalid request (only email verification links use this route)
    return NextResponse.redirect(`${requestUrl.origin}/signup?error=invalid_request`)
  }

  // Redirect to the next URL or home
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}

