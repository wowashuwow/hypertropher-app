"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  name: string
  email?: string
  city: string
  profile_picture_url?: string | null
  profile_picture_updated_at?: string | null
}

interface SessionContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  invalidateUserCache: () => void
  updateUserCity: (newCity: string) => void
  updateUserProfilePicture: (newUrl: string | null) => void
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfileCache, setUserProfileCache] = useState<UserProfile | null>(null)
  const supabase = createClient()

  // Fetch user profile data with event-based caching (no time expiration)
  const fetchUserProfile = async (userId: string, forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && userProfileCache) {
      setUserProfile(userProfileCache)
      return
    }
    
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        // Update cache (no timestamp needed)
        setUserProfileCache(profile)
      } else {
        setUserProfile(null)
        setUserProfileCache(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
      setUserProfileCache(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setUserProfileCache(null)
  }

  const invalidateUserCache = () => {
    setUserProfileCache(null)
  }

  const updateUserCity = (newCity: string) => {
    // Update only city field in both userProfile and cache
    if (userProfile) {
      const updatedProfile = { ...userProfile, city: newCity }
      setUserProfile(updatedProfile)
      setUserProfileCache(updatedProfile)
    }
  }

  const updateUserProfilePicture = (newUrl: string | null) => {
    // Update only profile_picture_url field in both userProfile and cache
    if (userProfile) {
      const updatedProfile = { 
        ...userProfile, 
        profile_picture_url: newUrl,
        profile_picture_updated_at: new Date().toISOString()
      }
      setUserProfile(updatedProfile)
      setUserProfileCache(updatedProfile)
    }
  }

  // Refresh session state (cache-safe: respects existing cache)
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        // Use forceRefresh = false to respect cache if available
        await fetchUserProfile(session.user.id, false)
      } else {
        setUserProfile(null)
        setUserProfileCache(null)
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
    }
  }

  return (
    <SessionContext.Provider value={{ user, userProfile, loading, signOut, invalidateUserCache, updateUserCity, updateUserProfilePicture, refreshSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
