"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { useSession } from "@/lib/auth/session-provider"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshSession } = useSession()
  const email = searchParams.get('email') || ''
  const mode = searchParams.get('mode') || 'login' // 'signup' or 'login'

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (otp.length !== 6) {
      setMessage({type: 'error', text: 'Please enter the complete 6-digit code'})
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh session state after OTP verification to ensure UI updates immediately
        await refreshSession()
        
        // Check if user needs to complete profile (signup flow)
        if (mode === 'signup' && !data.hasProfile) {
          // New user - redirect to complete profile
          router.push('/complete-profile')
        } else {
          // Existing user login or signup with profile - go to homepage
          router.push('/')
        }
      } else {
        setMessage({type: 'error', text: data.error || 'Invalid OTP code. Please try again.'})
        setOtp('') // Clear OTP on error
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setMessage({type: 'error', text: 'Network error. Please check your connection.'})
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setMessage(null)

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...(mode === 'signup' ? { inviteCode: searchParams.get('inviteCode') || '', provider: 'email_otp' } : {}),
          ...(mode === 'login' ? { useOtp: true } : {}),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({type: 'success', text: 'OTP code sent! Please check your email.'})
      } else {
        setMessage({type: 'error', text: data.error || 'Failed to resend OTP. Please try again.'})
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setMessage({type: 'error', text: 'Network error. Please check your connection.'})
    } finally {
      setIsResending(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verify Your Email
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-sm border-border/50">
            <CardContent className="pt-6">
              {/* Message Display */}
              {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      // Only allow numbers and limit to 6 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtp(value)
                    }}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending || isLoading}
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

