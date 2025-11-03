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
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get user info from Supabase Auth first to access user_metadata
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get invite code from multiple sources (priority order):
        // 1. URL parameter (for backward compatibility)
        // 2. User metadata (for email signup)
        const urlInviteCode = searchParams.get("inviteCode");
        const metadataInviteCode = user.user_metadata?.invite_code;
        
        if (!urlInviteCode && !metadataInviteCode) {
          console.error("Invite code is missing from all sources");
        }
      }
    };

    getUserInfo();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get invite code from multiple sources (priority order):
    // 1. URL parameter (for backward compatibility)
    // 2. User metadata (for email signup)
    let inviteCode = searchParams.get("inviteCode");
    
    // If invite code not found in URL, try to get from user metadata
    if (!inviteCode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.invite_code) {
        inviteCode = user.user_metadata.invite_code;
      }
    }
    
    if (!city || !inviteCode) {
      alert("Please fill out your city and ensure you have a valid invite code.");
      return;
    }
    
    // Name is required for all users
    if (!name) {
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
            Complete your profile to start contributing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                You can always change this later in your account settings.
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
