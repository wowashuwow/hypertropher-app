"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/lib/auth/session-provider"
import { ROUTES } from "@/lib/constants"
import { LandingPage } from "@/components/landing-page"

/**
 * Sends logged-in users to the app; incomplete profiles to complete-profile.
 * Shows landing only for signed-out visitors once session is resolved.
 * Add ?preview=landing to view the marketing page while logged in (e.g. local QA).
 */
export function LandingRedirect() {
  const { user, userProfile, loading } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewLanding = searchParams.get("preview") === "landing"

  useEffect(() => {
    if (previewLanding || loading) return

    if (user && userProfile?.city) {
      router.replace(ROUTES.app)
      return
    }

    if (user && !userProfile?.city) {
      router.replace(ROUTES.completeProfile)
    }
  }, [user, userProfile, loading, router, previewLanding])

  if (previewLanding) {
    return <LandingPage />
  }

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
