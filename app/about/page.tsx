import type { Metadata } from "next"
import { LandingPage } from "@/components/landing-page"

export const metadata: Metadata = {
  title: "About — Hypertropher",
  description:
    "Hypertropher is an invite-only trusted network for gym-goers who eat out for gains. Learn what we're building and why.",
}

export default function AboutPage() {
  return <LandingPage />
}
