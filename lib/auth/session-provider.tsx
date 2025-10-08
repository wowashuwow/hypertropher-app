"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  name: string
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

  return (
    <SessionContext.Provider value={{ user, userProfile, loading, signOut, invalidateUserCache }}>
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
