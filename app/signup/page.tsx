"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type AuthMode = 'signup' | 'login'

export default function SignUpPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  
  // Form fields
  const [inviteCode, setInviteCode] = useState("")
  const [email, setEmail] = useState("")
  
  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [codeValidationError, setCodeValidationError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setCodeValidationError(null)

    try {
      // Email OTP signup
      if (!email || !inviteCode) {
        setMessage({type: 'error', text: 'Email and invite code are required'})
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inviteCode,
          provider: 'email_otp',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success animation
        setShowSuccessAnimation(true)
        
        // Redirect after animation
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=signup`)
        }, 1500)
      } else {
        // Check if it's an invite code validation error
        if (data.error?.includes('Invalid invite code') || data.error?.includes('already been used')) {
          setCodeValidationError(data.error)
          setMessage({type: 'error', text: data.error || 'Signup failed'})
        } else {
          setMessage({type: 'error', text: data.error || 'Signup failed'})
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setMessage({type: 'error', text: 'Network error. Please check your connection.'})
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (!email) {
        setMessage({type: 'error', text: 'Email is required'})
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          useOtp: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`)
      } else {
        setMessage({type: 'error', text: data.error || 'Login failed'})
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage({type: 'error', text: 'Network error. Please check your connection.'})
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <MainLayout>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col items-center gap-4 animate-[zoomIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-[scaleIn_0.3s_ease-out]">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-foreground">Invite code verified!</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {authMode === 'signup' ? "Join Your Friends" : "Welcome Back"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {authMode === 'signup'
              ? "Enter your invite code and email to get started."
              : "Sign in to continue to Hypertropher."}
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

              {authMode === 'signup' ? (
                /* SIGNUP FORM */
                <form key="signup-form" onSubmit={handleSignup} className="space-y-4 auth-form-enter">
                  {/* Invite Code (only for signup) */}
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <div className="relative">
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Enter your invite code"
                        value={inviteCode}
                        onChange={(e) => {
                          setInviteCode(e.target.value.toUpperCase())
                          setCodeValidationError(null)
                        }}
                        required
                        disabled={isLoading}
                        className={`pr-10 ${codeValidationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {/* Icon container */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoading && authMode === 'signup' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : showSuccessAnimation ? (
                          <Check className="w-4 h-4 text-green-600 animate-[zoomIn_0.3s_ease-out]" />
                        ) : codeValidationError ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up"}
                  </Button>

                  {/* Toggle to Login */}
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM */
                <form key="login-form" onSubmit={handleLogin} className="space-y-4 auth-form-enter">
                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Log In"}
                  </Button>

                  {/* Toggle to Signup */}
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
