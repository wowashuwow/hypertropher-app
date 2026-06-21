import type { Metadata } from "next"
import { GuidePage } from "@/components/guide-page"

export const metadata: Metadata = {
  title: "Guide — Hypertropher",
  description:
    "How Hypertropher works — city filtering, ratings, contributing dishes, and using your invite codes.",
}

export default function Guide() {
  return <GuidePage />
}
