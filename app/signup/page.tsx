"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { createClient } from "@/lib/supabase/client"

type AuthMode = 'signup' | 'login'
type SignupMethod = 'email_password' | 'email_magic_link' | 'google'
type LoginMethod = 'email_password' | 'email_magic_link'

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
  
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (signupMethod === 'google') {
        // Google OAuth signup
        if (!inviteCode) {
          setMessage({type: 'error', text: 'Invite code is required'})
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode }),
        })

        const data = await response.json()

        if (response.ok && data.url) {
          // Store invite code in sessionStorage for callback handler
          sessionStorage.setItem('invite_code', inviteCode)
          // Redirect to Google OAuth
          window.location.href = data.url
        } else {
          setMessage({type: 'error', text: data.error || 'Failed to initiate Google sign-in'})
        }
      } else {
        // Email signup (password or magic link)
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
          setMessage({type: 'success', text: data.message})
          
          // For magic link, clear form
          if (signupMethod === 'email_magic_link') {
            setEmail('')
            setInviteCode('')
          }
        } else {
          setMessage({type: 'error', text: data.error || 'Signup failed'})
        }
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
          useMagicLink: loginMethod === 'email_magic_link',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (loginMethod === 'email_magic_link') {
          setMessage({type: 'success', text: data.message})
          setEmail('')
        } else {
          // Password login successful - redirect
          window.location.href = '/'
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

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        setMessage({type: 'error', text: error.message})
        setIsLoading(false)
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google login error:', error)
      setMessage({type: 'error', text: 'Failed to initiate Google sign-in'})
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
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAuthMode('signup')}
                >
                  Sign Up
                </Button>
                <Button
                  type="button"
                  variant={authMode === 'login' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAuthMode('login')}
                >
                  Log In
                </Button>
              </div>

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
                <form onSubmit={handleSignup} className="space-y-4">
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

                  {/* Google Signup Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      if (!inviteCode) {
                        setMessage({type: 'error', text: 'Invite code is required'})
                        return
                      }
                      setIsLoading(true)
                      setMessage(null)

                      try {
                        const response = await fetch('/api/auth/google', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ inviteCode }),
                        })

                        const data = await response.json()

                        if (response.ok && data.url) {
                          sessionStorage.setItem('invite_code', inviteCode)
                          window.location.href = data.url
                        } else {
                          setMessage({type: 'error', text: data.error || 'Failed to initiate Google sign-in'})
                          setIsLoading(false)
                        }
                      } catch (error) {
                        console.error('Google signup error:', error)
                        setMessage({type: 'error', text: 'Network error. Please check your connection.'})
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
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
                        variant={signupMethod === 'email_magic_link' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSignupMethod('email_magic_link')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + Magic Link
                      </Button>
                    </div>
                  </div>

                  {/* Email field */}
                  {signupMethod !== 'google' && (
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
                  )}

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
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Google Login Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

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
                        variant={loginMethod === 'email_magic_link' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLoginMethod('email_magic_link')}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Email + Magic Link
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
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
