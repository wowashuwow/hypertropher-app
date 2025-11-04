"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CitySearchInput } from "@/components/ui/city-search-input"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { useDishesCache } from "@/lib/cache/dishes-cache-provider"
import { toast } from "sonner"
import { Check, Copy } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { copyToClipboard } from "@/lib/clipboard"
import { createClient } from "@/lib/supabase/client"


interface InviteCode {
  code: string
  created_at: string
  is_used: boolean
  used_by_user_id: string | null
}

export default function AccountPage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai")
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [updatingCity, setUpdatingCity] = useState(false)
  const [userName, setUserName] = useState("")
  const [currentName, setCurrentName] = useState("")
  const [updatingName, setUpdatingName] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [usedByProfiles, setUsedByProfiles] = useState<Record<string, { name: string, profile_picture_url: string | null }>>({})
  const { user, signOut, invalidateUserCache, updateUserCity, updateUserProfilePicture } = useSession()
  const { invalidateCache: invalidateDishesCache } = useDishesCache()
  const supabase = createClient()

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
          setUserName(data.name || "")
          setCurrentName(data.name || "")
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

  // Fetch user's invite codes and used-by profiles
  useEffect(() => {
    const fetchInviteCodes = async () => {
      try {
        setLoadingCodes(true)
        const response = await fetch('/api/invite-codes')
        if (response.ok) {
          const data = await response.json()
          setInviteCodes(data)
          
          // Fetch profiles for used codes
          const usedUserIds = data
            .filter((code: InviteCode) => code.is_used && code.used_by_user_id)
            .map((code: InviteCode) => code.used_by_user_id)
            .filter((id: string | null): id is string => id !== null)
          
          if (usedUserIds.length > 0) {
            const profiles: Record<string, { name: string, profile_picture_url: string | null }> = {}
            
            // Fetch profiles in parallel using RPC function
            await Promise.all(
              usedUserIds.map(async (userId: string) => {
                try {
                  const { data: profile, error } = await supabase.rpc(
                    'get_user_profile_by_id',
                    { user_id_input: userId }
                  )
                  
                  if (!error && profile) {
                    profiles[userId] = {
                      name: profile.name,
                      profile_picture_url: profile.profile_picture_url
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching profile for ${userId}:`, error)
                }
              })
            )
            
            setUsedByProfiles(profiles)
          }
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
  }, [user, supabase])

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
        // Update city in session context immediately (no loading flicker)
        updateUserCity(newCity)
        // Invalidate dishes cache so discover page fetches dishes for new city
        invalidateDishesCache()
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

  const handleNameUpdate = async () => {
    if (userName === currentName || !userName.trim()) return
    
    try {
      setUpdatingName(true)
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName.trim() }),
      })

      if (response.ok) {
        setCurrentName(userName)
        toast.success("Name updated successfully!", {
          duration: 4000,
        })
        // Invalidate cache to refresh name everywhere
        invalidateUserCache()
      } else {
        const errorData = await response.json()
        toast.error(`Failed to update name: ${errorData.error}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error updating name:', error)
      toast.error("Failed to update name. Please try again.", {
        duration: 5000,
      })
    } finally {
      setUpdatingName(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const copyInviteCode = async (code: string) => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } else {
      toast.error("Failed to copy invite code", {
        duration: 2000,
      })
    }
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
                  {inviteCodes.map((inviteCode) => {
                    const usedByProfile = inviteCode.used_by_user_id ? usedByProfiles[inviteCode.used_by_user_id] : null
                    const firstName = usedByProfile?.name.split(' ')[0] || 'User'
                    const firstNameInitial = firstName.charAt(0).toUpperCase()
                    const isCopied = copiedCode === inviteCode.code
                    
                    return (
                      <div key={inviteCode.code} className={`flex flex-col gap-2 p-3 border rounded-lg ${
                        inviteCode.is_used ? 'bg-muted/50 opacity-75' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-lg font-semibold">{inviteCode.code}</p>
                              {!inviteCode.is_used && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteCode(inviteCode.code)}
                            disabled={inviteCode.is_used}
                            className="flex items-center gap-2"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        {inviteCode.is_used && inviteCode.used_by_user_id && usedByProfile && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Used by</span>
                            <Avatar className="w-6 h-6">
                              {usedByProfile.profile_picture_url ? (
                                <AvatarImage 
                                  src={usedByProfile.profile_picture_url} 
                                  alt={`${firstName}'s profile`}
                                />
                              ) : null}
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                                {firstNameInitial}
                              </AvatarFallback>
                            </Avatar>
                            <span>{firstName}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No invite codes available.</p>
              )}
            </div>

            {/* Name Editing Section */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Your Name
              </Label>
              {loadingProfile ? (
                <div className="p-3 border rounded-lg bg-muted animate-pulse">
                  <p className="text-muted-foreground">Loading name...</p>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <Input
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={updatingName}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleNameUpdate}
                    disabled={updatingName || userName === currentName}
                    size="sm"
                  >
                    {updatingName ? "Saving..." : "Update"}
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                This name will be shown when you add dishes
              </p>
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
                  onImageChange={(newImageUrl) => {
                    setProfilePictureUrl(newImageUrl)
                    // Update profile picture in session context immediately
                    updateUserProfilePicture(newImageUrl)
                  }}
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
