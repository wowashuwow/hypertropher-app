import type { Metadata } from "next"
import { RoadmapPage } from "@/components/roadmap-page"

export const metadata: Metadata = {
  title: "Roadmap — Hypertropher",
  description:
    "Where Hypertropher is going — friends-only mode, friends-of-friends discovery, and social proof tied to real relationships.",
}

export default function Roadmap() {
  return <RoadmapPage />
}
