"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [isSignUp, setIsSignUp] = useState(true) // true for signup, false for login
  const [inviteCode, setInviteCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`
      
      // Choose API endpoint based on signup/login mode
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
      const body = isSignUp 
        ? { phone: fullPhoneNumber, inviteCode: inviteCode }
        : { phone: fullPhoneNumber }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
      } else {
        alert(data.error || 'An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: 'sms',
      })

      if (error) {
        alert('Invalid OTP. Please try again.')
      } else {
        // Redirect based on signup/login mode
        if (isSignUp) {
          window.location.href = `/complete-profile?inviteCode=${inviteCode}`
        } else {
          // For login, redirect to homepage
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      alert('An error occurred during verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    setOtpSent(false)
    setOtp('')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">HYPERTROPHER</h1>
        <p className="mt-2 text-muted-foreground">
          Find high protein meals near you. Vetted and verified by bodybuilders just like you.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {otpSent ? "Verify Your Phone" : (isSignUp ? "Join Your Friends" : "Welcome Back")}
          </CardTitle>
          <CardDescription>
            {otpSent 
              ? `We've sent an OTP to ${countryCode}${phoneNumber}` 
              : (isSignUp 
                ? "Enter your invite code and phone number to get started."
                : "Enter your phone number to log in.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter your invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex">
                    <select 
                      className="px-3 py-2 border border-input rounded-l-md bg-background text-sm"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
              
              {/* Toggle between signup and login */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setInviteCode("")
                    setPhoneNumber("")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp 
                    ? "Already have an account? Log in" 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoBack}
                disabled={isLoading}
              >
                Edit Phone Number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
