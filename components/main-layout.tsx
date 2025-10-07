"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useSession } from "@/lib/auth/session-provider"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useSession()
  const pathname = usePathname()
  const isLoggedIn = !!user

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center loading-fade-enter-active">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} />
      <main 
        className="pb-20 lg:pb-0 overflow-x-hidden page-transition-enter-active"
        data-route={pathname}
        key={pathname} // Forces re-render for CSS transitions
      >
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}
