import type React from "react"
import type { Metadata } from "next"
import { Rethink_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "@/lib/auth/session-provider"
import { Toaster } from "sonner"
import "./globals.css"

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-rethink-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Hypertropher", // Updated app name in metadata
  description: "Discover high-protein, affordable meals from restaurants",
  generator: "v0.app",
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
          <Suspense fallback={null}>{children}</Suspense>
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
