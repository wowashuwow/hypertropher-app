"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// NOTE: This is a simplified list. We can expand it later.
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad", "Kolkata"
];

export default function CompleteProfilePage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("inviteCode");
    if (code) {
      // You might want to store this in a state if it needs to be reactive,
      // but for submission, we can grab it directly in handleSubmit.
    } else {
      // Handle cases where the invite code is missing, maybe redirect back to signup
      console.error("Invite code is missing from URL.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inviteCode = searchParams.get("inviteCode");
    
    if (!name || !city || !inviteCode) {
      alert("Please fill out your name and city.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, city, inviteCode }),
      });

      if (response.ok) {
        // On success, redirect to homepage
        window.location.href = '/';
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
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">HYPERTROPHER</h1>
        <p className="mt-2 text-muted-foreground">
          Find high protein meals near you. Vetted and verified by bodybuilders just like you.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">One Last Step</CardTitle>
          <CardDescription>Complete your profile to start contributing.</CardDescription>
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
               <Select value={city} onValueChange={setCity} required>
                  <SelectTrigger id="city-select">
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
