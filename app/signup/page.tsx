"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth/session-provider"

type AuthMode = 'signup' | 'login'
type SignupMethod = 'email_password' | 'email_otp'
type LoginMethod = 'email_password' | 'email_otp'

export default function SignUpPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email_password')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email_password')
  
  // Form fields
  const [inviteCode, setInviteCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const router = useRouter()
  const { refreshSession } = useSession()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Email signup (password or OTP)
      if (!email || !inviteCode) {
        setMessage({type: 'error', text: 'Email and invite code are required'})
        setIsLoading(false)
        return
      }

      if (signupMethod === 'email_password') {
        if (!password || password.length < 6) {
          setMessage({type: 'error', text: 'Password must be at least 6 characters'})
          setIsLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setMessage({type: 'error', text: 'Passwords do not match'})
          setIsLoading(false)
          return
        }
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: signupMethod === 'email_password' ? password : undefined,
          inviteCode,
          provider: signupMethod,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // For OTP signup, redirect to verification page
        if (signupMethod === 'email_otp') {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=signup`)
        } else {
          // Email + Password signup - show success message
          setMessage({type: 'success', text: data.message})
        }
      } else {
        setMessage({type: 'error', text: data.error || 'Signup failed'})
      }
    } catch (error) {
      console.error('Signup error:', error)
      setMessage({type: 'error', text: 'Network error. Please check your connection.'})
    } finally {
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

      if (loginMethod === 'email_password' && !password) {
        setMessage({type: 'error', text: 'Password is required'})
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: loginMethod === 'email_password' ? password : undefined,
          useOtp: loginMethod === 'email_otp',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (loginMethod === 'email_otp') {
          // Redirect to OTP verification page
          router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`)
        } else {
          // Password login successful - refresh session state then redirect
          await refreshSession()
          router.push('/')
        }
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
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter your invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Signup Method Selection */}
                  <div className="space-y-2">
                    <Label>Sign up with</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={signupMethod === 'email_password' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSignupMethod('email_password')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + Password
                      </Button>
                      <Button
                        type="button"
                        variant={signupMethod === 'email_otp' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSignupMethod('email_otp')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + OTP
                      </Button>
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

                  {/* Password fields (only for email_password) */}
                  {signupMethod === 'email_password' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

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
                  {/* Login Method Selection */}
                  <div className="space-y-2">
                    <Label>Log in with</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={loginMethod === 'email_password' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLoginMethod('email_password')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + Password
                      </Button>
                      <Button
                        type="button"
                        variant={loginMethod === 'email_otp' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLoginMethod('email_otp')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + OTP
                      </Button>
                    </div>
                  </div>

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

                  {/* Password field (only for email_password) */}
                  {loginMethod === 'email_password' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="loginPassword">Password</Label>
                        <a
                          href="/reset-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}

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
