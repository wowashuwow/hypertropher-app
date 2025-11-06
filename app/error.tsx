'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging (in production, this would go to error tracking)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We're sorry for the inconvenience. Please try again or return home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg" className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/" className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

