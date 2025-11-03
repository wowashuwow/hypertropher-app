"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CitySearchInput } from "@/components/ui/city-search-input"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/lib/auth/session-provider"
import { MainLayout } from "@/components/main-layout"


export default function CompleteProfilePage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const { refreshSession, invalidateUserCache, userProfile, loading, user } = useSession();

  // Redirect if profile is already complete
  useEffect(() => {
    if (!loading && userProfile && userProfile.city) {
      router.push('/');
    }
  }, [userProfile, loading, router]);

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
      setMessage({type: 'error', text: "Please fill out your city and ensure you have a valid invite code."});
      return;
    }
    
    // Name is required for all users
    if (!name) {
      setMessage({type: 'error', text: "Please enter your name."});
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, city, inviteCode, profilePictureUrl }),
      });

      if (response.ok) {
        // Invalidate cache and refresh session to ensure fresh profile data (including profile picture)
        invalidateUserCache();
        await refreshSession();
        // Redirect to homepage after session is refreshed
        router.push('/');
      } else {
        const data = await response.json();
        setMessage({type: 'error', text: data.error || 'Failed to update profile. Please try again.'});
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({type: 'error', text: 'Network error. Please check your connection and try again.'});
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect non-authenticated users to signup
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [loading, user, router]);

  // Fast path: If profile is already loaded and complete, prevent form render (redirect will happen)
  if (!loading && userProfile && userProfile.city) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading while session is loading OR while waiting for profile data OR during redirect
  if (loading || (!loading && !user) || (!loading && user && userProfile === null)) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Only render form when we're certain profile is incomplete
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Complete Your Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Just a few more steps to get started!
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
      </div>
    </MainLayout>
  );
}
