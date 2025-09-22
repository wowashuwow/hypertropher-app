"use client"

import type React from "react"

import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"

interface MainLayoutProps {
  children: React.ReactNode
  isLoggedIn?: boolean
}

export function MainLayout({ children, isLoggedIn = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} />
      <main className="pb-20 lg:pb-0">{children}</main>
      {isLoggedIn && <BottomNavigation />}
    </div>
  )
}
