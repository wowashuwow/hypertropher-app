import type { Metadata } from "next"
import { Suspense } from "react"
import { LandingRedirect } from "@/components/landing-redirect"

export const metadata: Metadata = {
  title: "Hypertropher — Shared Protein Diary for Serious Lifters",
  description:
    "Invite-only app for gym-goers who eat out. Discover, rate, and log high-protein dishes from restaurants and delivery apps. Built by lifters, for lifters.",
  openGraph: {
    title: "Hypertropher — Shared Protein Diary for Serious Lifters",
    description:
      "Invite-only app for gym-goers who eat out. Discover, rate, and log high-protein dishes from restaurants and delivery apps.",
  },
}

function LandingLoading() {
  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function LandingRoutePage() {
  return (
    <Suspense fallback={<LandingLoading />}>
      <LandingRedirect />
    </Suspense>
  )
}
