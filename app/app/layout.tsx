import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover High-Protein Meals | Hypertropher",
  description:
    "Browse community-verified high-protein dishes from restaurants and delivery apps. Filter by protein, price, and distance.",
  openGraph: {
    title: "Discover High-Protein Meals | Hypertropher",
    description:
      "Find great-tasting, high-protein dishes trusted by serious lifters who eat out.",
  },
}

export default function AppDiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
