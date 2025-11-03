"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth/session-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading) {
      // If no user at all, redirect to signup
      if (!user) {
        setIsRedirecting(true)
        router.push('/signup')
      }
      // If user exists but no profile (incomplete signup), redirect to complete-profile
      else if (!userProfile) {
        setIsRedirecting(true)
        router.push('/complete-profile')
      }
    }
  }, [user, userProfile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Require both user (Supabase Auth) and userProfile (users table) for access
  if (!user || !userProfile || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}