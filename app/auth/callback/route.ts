import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/signup?error=auth_failed`)
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
        // For Google OAuth, invite code should be in session storage
        return NextResponse.redirect(`${requestUrl.origin}/complete-profile`)
      }
    }
  }

  // Redirect to the next URL or home
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}

