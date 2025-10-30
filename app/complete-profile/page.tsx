"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CitySearchInput } from "@/components/ui/city-search-input"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { createClient } from "@/lib/supabase/client"


export default function CompleteProfilePage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNameField, setShowNameField] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [authProvider, setAuthProvider] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get invite code from URL or sessionStorage (Google OAuth flow)
    const urlInviteCode = searchParams.get("inviteCode");
    const storedInviteCode = sessionStorage.getItem("invite_code");
    
    if (!urlInviteCode && !storedInviteCode) {
      console.error("Invite code is missing");
    }

    // Get user info from Supabase Auth
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || "");
        setAuthProvider(user.app_metadata.provider || "");
        
        // For Google users, pre-fill name and profile picture
        if (user.app_metadata.provider === 'google') {
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          const googleAvatar = user.user_metadata?.avatar_url || null;
          
          if (googleName) {
            setName(googleName);
            setShowNameField(true); // Still show field but editable
          }
          
          if (googleAvatar) {
            setProfilePictureUrl(googleAvatar);
          }
        } else {
          // For email users, name field is required
          setShowNameField(true);
        }
      }
    };

    getUserInfo();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get invite code from URL or sessionStorage
    const inviteCode = searchParams.get("inviteCode") || sessionStorage.getItem("invite_code");
    
    if (!city || !inviteCode) {
      alert("Please fill out your city and ensure you have a valid invite code.");
      return;
    }
    
    // Name is optional for Google users (will use Google name), required for email users
    if (authProvider !== 'google' && !name) {
      alert("Please enter your name.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, city, inviteCode, profilePictureUrl }),
      });

      if (response.ok) {
        // Clear invite code from sessionStorage
        sessionStorage.removeItem("invite_code");
        // Redirect to homepage
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">HYPERTROPHER</h1>
        <p className="mt-2 text-muted-foreground">
          Find high protein meals near you. Vetted and verified by bodybuilders just like you.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">One Last Step</CardTitle>
          <CardDescription>
            {authProvider === 'google' 
              ? "Select your city to complete your profile" 
              : "Complete your profile to start contributing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showNameField && (
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={authProvider !== 'google'}
                />
                {authProvider === 'google' && (
                  <p className="text-xs text-muted-foreground">
                    You can edit this name from your account settings later
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="city-select">Your Primary City</Label>
               <CitySearchInput
                  value={city}
                  onChange={setCity}
                  placeholder="Search for your city..."
                  className="w-full"
                />
            </div>

            <div className="space-y-2">
              <Label>Profile Picture (Optional)</Label>
              <ProfilePictureUpload
                currentImageUrl={profilePictureUrl}
                onImageChange={setProfilePictureUrl}
                disabled={isLoading}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {authProvider === 'google' 
                  ? "Using your Google profile picture. You can change this later."
                  : "You can always change this later in your account settings."}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Let's Go!"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
