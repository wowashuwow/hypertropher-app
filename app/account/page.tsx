"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CitySearchInput } from "@/components/ui/city-search-input"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { toast } from "sonner"


interface InviteCode {
  code: string
  created_at: string
  is_used: boolean
}

export default function AccountPage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai")
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [updatingCity, setUpdatingCity] = useState(false)
  const { user, signOut } = useSession()

  // Fetch user's profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true)
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setSelectedCity(data.city || "Mumbai")
          setProfilePictureUrl(data.profile_picture_url || null)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Fetch user's invite codes
  useEffect(() => {
    const fetchInviteCodes = async () => {
      try {
        setLoadingCodes(true)
        const response = await fetch('/api/invite-codes')
        if (response.ok) {
          const data = await response.json()
          setInviteCodes(data)
        }
      } catch (error) {
        console.error('Error fetching invite codes:', error)
      } finally {
        setLoadingCodes(false)
      }
    }

    if (user) {
      fetchInviteCodes()
    }
  }, [user])

  const handleCityChange = async (newCity: string) => {
    if (newCity === selectedCity) return // No change needed
    
    const previousCity = selectedCity
    
    try {
      setUpdatingCity(true)
      
      // Optimistic update - immediately update UI
      setSelectedCity(newCity)
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: newCity }),
      })

      if (response.ok) {
        toast.success("City updated successfully!", {
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        // Revert optimistic update on failure
        setSelectedCity(previousCity)
        toast.error(`Failed to update city: ${errorData.error}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error updating city:', error)
      // Revert optimistic update on failure
      setSelectedCity(previousCity)
      toast.error("Failed to update city. Please try again.", {
        duration: 5000,
      })
    } finally {
      setUpdatingCity(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-2xl mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold text-foreground mb-8">Your Account</h1>

          <div className="space-y-6">
            {/* City Selector */}
            <div className="space-y-2">
              <Label htmlFor="city-select" className="text-base font-medium">
                Your Current City
              </Label>
              {loadingProfile ? (
                <div className="p-3 border rounded-lg bg-muted animate-pulse">
                  <p className="text-muted-foreground">Loading city...</p>
                </div>
              ) : (
                <CitySearchInput
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="Search for your city..."
                  disabled={updatingCity}
                  className="w-full"
                />
              )}
            </div>

            {/* Invite Codes Section */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Your Invite Codes</Label>
              {loadingCodes ? (
                <p className="text-muted-foreground">Loading invite codes...</p>
              ) : inviteCodes.length > 0 ? (
                <div className="space-y-2">
                  {inviteCodes.map((inviteCode) => (
                    <div key={inviteCode.code} className={`flex items-center justify-between p-3 border rounded-lg ${
                      inviteCode.is_used ? 'bg-muted/50 opacity-75' : ''
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-lg font-semibold">{inviteCode.code}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            inviteCode.is_used 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {inviteCode.is_used ? 'Used' : 'Available'}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteCode(inviteCode.code)}
                        disabled={inviteCode.is_used}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No invite codes available.</p>
              )}
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Profile Picture</Label>
              {loadingProfile ? (
                <div className="p-3 border rounded-lg bg-muted animate-pulse">
                  <p className="text-muted-foreground">Loading profile picture...</p>
                </div>
              ) : (
                <ProfilePictureUpload
                  currentImageUrl={profilePictureUrl}
                  onImageChange={setProfilePictureUrl}
                  disabled={updatingCity}
                  className="w-full"
                />
              )}
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Phone Number</Label>
              <p className="text-muted-foreground">{user?.phone}</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
