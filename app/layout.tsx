import type React from "react"
import type { Metadata } from "next"
import { Rethink_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "@/lib/auth/session-provider"
import { DishesCacheProvider } from "@/lib/cache/dishes-cache-provider"
import { Toaster } from "sonner"
import "./globals.css"

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-rethink-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Hypertropher - Discover High-Protein Meals",
  description: "A trusted, community-driven database of high-protein dishes from local restaurants and delivery apps. Find great-tasting, affordable protein-rich meals.",
  keywords: ["high protein meals", "protein foods", "restaurant finder", "fitness nutrition"],
  authors: [{ name: "Hypertropher" }],
  creator: "Hypertropher",
  publisher: "Hypertropher",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hypertropher.com'),
  openGraph: {
    title: "Hypertropher - Discover High-Protein Meals",
    description: "Find great-tasting, high-protein dishes from restaurants",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://hypertropher.com",
    siteName: "Hypertropher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypertropher - Discover High-Protein Meals",
    description: "Find great-tasting, high-protein dishes from restaurants",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  // Debug API key loading
  console.log('Google Maps API Key loaded:', googleMapsApiKey ? 'Present' : 'Missing')
  
  if (!googleMapsApiKey) {
    console.error('❌ Google Maps API Key is missing! Please check your .env.local file')
  }

  return (
    <html lang="en">
      <head>
        {googleMapsApiKey && (
          <script
            async
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
          />
        )}
        {!googleMapsApiKey && (
          <script dangerouslySetInnerHTML={{
            __html: `console.error('❌ Google Maps API Key not found - check your .env.local file')`
          }} />
        )}
      </head>
      <body className={`font-sans ${rethinkSans.variable} ${GeistMono.variable}`}>
        <SessionProvider>
          <DishesCacheProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </DishesCacheProvider>
        </SessionProvider>
        <Toaster 
          position="top-center"
          duration={3000}
          expand={true}
          gap={8}
          offset="16px"
          richColors={true}
        />
        <Analytics />
      </body>
    </html>
  )
}
