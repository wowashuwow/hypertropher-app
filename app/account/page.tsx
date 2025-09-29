"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivli",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Solapur",
  "Hubli-Dharwad",
  "Tiruchirappalli",
  "Bareilly",
  "Mysore",
  "Tiruppur",
  "Gurgaon",
  "Aligarh",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai Nagar",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Bhavnagar",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Gulbarga",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Jammu",
  "Sangli-Miraj & Kupwad",
  "Mangalore",
  "Erode",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Maheshtala",
]

interface InviteCode {
  code: string
  created_at: string
  is_used: boolean
}

export default function AccountPage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai")
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
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

  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      setSaveMessage("")
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: selectedCity }),
      })

      if (response.ok) {
        setSaveMessage("City updated successfully!")
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setSaveMessage(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving city:', error)
      setSaveMessage("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
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
            {/* User Info */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Phone Number</Label>
              <p className="text-muted-foreground">{user?.phone}</p>
            </div>

            {/* City Selector */}
            <div className="space-y-2">
              <Label htmlFor="city-select" className="text-base font-medium">
                Your City
              </Label>
              {loadingProfile ? (
                <div className="p-3 border rounded-lg bg-muted animate-pulse">
                  <p className="text-muted-foreground">Loading city...</p>
                </div>
              ) : (
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <div key={inviteCode.code} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-mono text-lg font-semibold">{inviteCode.code}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(inviteCode.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteCode(inviteCode.code)}
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

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-3 rounded-lg text-center ${
                saveMessage.includes("Error") || saveMessage.includes("Failed") 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-green-50 text-green-700"
              }`}>
                {saveMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleSaveChanges} 
                className="flex-1" 
                disabled={saving || loadingProfile}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex-1 bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
