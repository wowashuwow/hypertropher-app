"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

// Dish type matching the app's dish interface
interface Dish {
  id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: string
  protein: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  addedBy: string
  addedByProfilePicture?: string | null
  image_url: string
  protein_source: string
  users: { name: string; profile_picture_url?: string | null }
  restaurant?: {
    id: string
    name: string
    city: string
    source_type: 'google_maps' | 'manual'
    place_id?: string
    google_maps_address?: string
    latitude?: number
    longitude?: number
    manual_address?: string
    is_cloud_kitchen: boolean
    verified: boolean
  }
  hasInStore?: boolean
  deliveryApps?: string[]
  availability?: "In-Store" | "Online" | "Both"
  delivery_apps?: string[]
  place_id?: string | null
  distance?: number
}

type ProteinSource = "All" | "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Beef" | "Other"

interface FilterState {
  proteinSource: ProteinSource
  sortBy: string
  distanceRange: string
}

interface DishesCache {
  dishes: Dish[]
  city: string
  filters: FilterState
  scrollPosition: number
  lastFetchTimestamp: number
}

interface DishesCacheContextType {
  getCachedDishes: (city: string) => Dish[] | null
  setCachedDishes: (city: string, dishes: Dish[]) => void
  invalidateCache: () => void
  getFilters: () => FilterState | null
  setFilters: (filters: FilterState) => void
  getScrollPosition: () => number
  setScrollPosition: (position: number) => void
}

const DishesCacheContext = createContext<DishesCacheContextType | undefined>(undefined)

export function DishesCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DishesCache | null>(null)

  const getCachedDishes = useCallback((city: string): Dish[] | null => {
    if (!cache) return null
    if (cache.city !== city) return null
    return cache.dishes
  }, [cache])

  const setCachedDishes = useCallback((city: string, dishes: Dish[]) => {
    setCache(prev => ({
      dishes,
      city,
      filters: prev?.filters || {
        proteinSource: "All",
        sortBy: "default",
        distanceRange: "whole-city"
      },
      scrollPosition: prev?.scrollPosition || 0,
      lastFetchTimestamp: Date.now()
    }))
  }, [])

  const invalidateCache = useCallback(() => {
    console.log('🗑️ Dishes cache invalidated')
    setCache(null)
  }, [])

  const getFilters = useCallback((): FilterState | null => {
    return cache?.filters || null
  }, [cache])

  const setFilters = useCallback((filters: FilterState) => {
    setCache(prev => {
      if (!prev) return null
      return {
        ...prev,
        filters
      }
    })
  }, [])

  const getScrollPosition = useCallback((): number => {
    return cache?.scrollPosition || 0
  }, [cache])

  const setScrollPosition = useCallback((position: number) => {
    setCache(prev => {
      if (!prev) return null
      return {
        ...prev,
        scrollPosition: position
      }
    })
  }, [])

  return (
    <DishesCacheContext.Provider
      value={{
        getCachedDishes,
        setCachedDishes,
        invalidateCache,
        getFilters,
        setFilters,
        getScrollPosition,
        setScrollPosition
      }}
    >
      {children}
    </DishesCacheContext.Provider>
  )
}

export function useDishesCache() {
  const context = useContext(DishesCacheContext)
  if (context === undefined) {
    throw new Error("useDishesCache must be used within a DishesCacheProvider")
  }
  return context
}



