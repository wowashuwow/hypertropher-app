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

  // Handle email verification flow (legacy magic link fallback)
  // NOTE: With OTP email template update, users now receive codes instead of links.
  // This route is kept as a fallback for any old PKCE magic links in email inboxes.
  // OTP codes are handled via /api/auth/verify-otp (called from /verify-otp page).
  
  // Only support PKCE flow (token_hash) - implicit flow (token) requires email which we don't have
  if (!tokenHash) {
    // No token_hash - invalid request (or old implicit flow link which we don't support)
    return NextResponse.redirect(`${requestUrl.origin}/signup?error=invalid_request`)
  }
  
  const verifyType = type || 'email'
  
  // Verify the PKCE token hash
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: verifyType as 'email' | 'signup' | 'recovery' | 'invite',
  })
    
  if (verifyError) {
    console.error('Email verification error:', verifyError)
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

  // Redirect to the next URL or home
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}

