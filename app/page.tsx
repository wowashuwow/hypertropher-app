"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useSession } from "@/lib/auth/session-provider"
import { InlineCitySelector } from "@/components/ui/inline-city-selector"
import { BeFirstModal } from "@/components/ui/be-first-modal"
import { useGeolocation } from "@/lib/hooks/use-geolocation"


type ProteinSource = "All" | "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Beef" | "Other"

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
  // New restaurant-centric fields
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
  // Legacy fields for backward compatibility
  availability?: "In-Store" | "Online" | "Both"
  delivery_apps?: string[]
  place_id?: string | null
  // Distance field for sorting
  distance?: number
}

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())
  const [selectedProteinFilter, setSelectedProteinFilter] = useState<ProteinSource>("All")
  const [sortBy, setSortBy] = useState("default")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Pune, India") // Default to Pune
  const [userName, setUserName] = useState("User")
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // New state for non-authenticated users
  const [citiesWithDishes, setCitiesWithDishes] = useState<Array<{city: string, dishCount: number}>>([])
  const [selectedCity, setSelectedCity] = useState("Pune, India") // Default to Pune
  const [isBeFirstModalOpen, setIsBeFirstModalOpen] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  
  const { user, userProfile } = useSession()
  const { userLocation, locationPermissionGranted, locationPermissionRequested, locationError, requestLocationPermission, loading: locationLoading } = useGeolocation()

  // Use SessionProvider data instead of fetching separately
  useEffect(() => {
    if (userProfile) {
      setUserCity(userProfile.city || "Pune, India")
      setUserName(userProfile.name || "User")
      setLoadingProfile(false)
    } else if (user === null) {
      // For unauthenticated users, set default values and stop loading
      setUserName("gym bud")
      setUserCity("Pune, India")
      setLoadingProfile(false)
    }
  }, [userProfile, user])

  // NEW: Load data with parallel API calls for non-authenticated users
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (user) {
          // Authenticated users: existing flow (unchanged)
        const response = await fetch('/api/dishes')
        if (!response.ok) {
          throw new Error('Failed to fetch dishes')
        }
        const data = await response.json()
        
        const transformedDishes = data.map((dish: any) => ({
          id: dish.id,
          dish_name: dish.dish_name,
          restaurant_name: dish.restaurant_name,
          city: dish.city,
          price: `₹${dish.price}`,
          protein: dish.protein_content,
          taste: dish.taste,
          satisfaction: dish.satisfaction,
          comment: dish.comment,
          addedBy: dish.users?.name || "Unknown",
          addedByProfilePicture: dish.users?.profile_picture_url || null,
          availability: dish.availability as "In-Store" | "Online" | "Both",
          image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
          protein_source: dish.protein_source,
          delivery_apps: dish.delivery_apps || [],
          place_id: dish.place_id,
          users: dish.users,
          restaurant: dish.restaurant,
          hasInStore: dish.hasInStore,
          deliveryApps: dish.deliveryApps || dish.delivery_apps || []
        }))
        
        setDishes(transformedDishes)
        } else {
          // Non-authenticated users: parallel loading
          const [dishesResponse, citiesResponse] = await Promise.all([
            fetch('/api/dishes?city=Pune, India'), // Start with Pune
            fetch('/api/cities-with-dishes')
          ])

          // Process dishes
          if (dishesResponse.ok) {
            const dishesData = await dishesResponse.json()
            const transformedDishes = dishesData.map((dish: any) => ({
              id: dish.id,
              dish_name: dish.dish_name,
              restaurant_name: dish.restaurant_name,
              city: dish.city,
              price: `₹${dish.price}`,
              protein: dish.protein_content,
              taste: dish.taste,
              satisfaction: dish.satisfaction,
              comment: dish.comment,
              addedBy: dish.users?.name || "Unknown",
              addedByProfilePicture: dish.users?.profile_picture_url || null,
              availability: dish.availability as "In-Store" | "Online" | "Both",
              image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
              protein_source: dish.protein_source,
              delivery_apps: dish.delivery_apps || [],
              place_id: dish.place_id,
              users: dish.users,
              restaurant: dish.restaurant,
              hasInStore: dish.hasInStore,
              deliveryApps: dish.deliveryApps || dish.delivery_apps || []
            }))
            setDishes(transformedDishes)
          } else {
            throw new Error('Failed to fetch dishes')
          }

          // Process cities
          if (citiesResponse.ok) {
            const citiesData = await citiesResponse.json()
            setCitiesWithDishes(citiesData)
            
            // Set default city to Pune if available, otherwise first city
            const puneCity = citiesData.find((c: {city: string, dishCount: number}) => c.city === "Pune, India")
            if (puneCity) {
              setSelectedCity("Pune, India")
            } else if (citiesData.length > 0) {
              setSelectedCity(citiesData[0].city)
            }
          } else {
            console.error('Failed to fetch cities, using fallback')
            // Fallback: extract cities from dishes
            const fallbackCities = getCitiesFromDishes(dishes)
            setCitiesWithDishes(fallbackCities)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load dishes. Please try again later.')
        setDishes([])
      } finally {
        setLoading(false)
        setLoadingCities(false)
      }
    }

    loadData()
  }, [user]) // Only depend on user, not selectedCity

  // Fetch user's wishlist to populate bookmarked dishes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const wishlistDishes = await response.json()
          const wishlistIds = new Set<string>(wishlistDishes.map((dish: any) => dish.id as string))
          setBookmarkedDishes(wishlistIds)
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    }

    fetchWishlist()
  }, [user])

  // Handle location permission denial - reset sort if permission was denied for distance-based sorts
  useEffect(() => {
    if (locationPermissionRequested && !locationPermissionGranted && !locationLoading) {
      if (sortBy === 'nearest' || sortBy === 'nearest-cheapest' || sortBy === 'nearest-expensive') {
        // Permission was requested but denied, reset to default
        setSortBy('default')
      }
    }
  }, [locationPermissionRequested, locationPermissionGranted, locationLoading, sortBy])

  // Handle case where user has permission but no location data yet for distance-based sorting
  useEffect(() => {
    const needsLocationData = sortBy === 'nearest' || sortBy === 'nearest-cheapest' || sortBy === 'nearest-expensive'
    
    if (needsLocationData && 
        locationPermissionGranted && 
        !userLocation && 
        !locationLoading && 
        locationPermissionRequested) {
      // User has permission but we don't have location data, request it
      console.log('📍 User selected distance sorting, permission granted but no location, requesting...')
      requestLocationPermission()
    }
  }, [sortBy, locationPermissionGranted, userLocation, locationLoading, locationPermissionRequested, requestLocationPermission])

  const handleBookmarkToggle = async (dishId: string) => {
    const isCurrentlyBookmarked = bookmarkedDishes.has(dishId)
    
    try {
      if (isCurrentlyBookmarked) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dish_id: dishId }),
        })
        
        if (response.ok) {
          setBookmarkedDishes((prev) => {
            const newSet = new Set(prev)
            newSet.delete(dishId)
            return newSet
          })
        } else {
          console.error('Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dish_id: dishId }),
        })
        
        if (response.ok) {
          setBookmarkedDishes((prev) => {
            const newSet = new Set(prev)
            newSet.add(dishId)
            return newSet
          })
        } else {
          console.error('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  // NEW: Handle city change for non-authenticated users
  const handleCityChange = async (newCity: string) => {
    if (newCity === 'be-first') {
      setIsBeFirstModalOpen(true)
      return
    }

    if (user) return // Authenticated users don't use this

    setSelectedCity(newCity)
    setLoading(true)

    try {
      // Fetch dishes for selected city
      const response = await fetch(`/api/dishes?city=${encodeURIComponent(newCity)}`)
      if (response.ok) {
        const data = await response.json()
        const transformedDishes = data.map((dish: any) => ({
          id: dish.id,
          dish_name: dish.dish_name,
          restaurant_name: dish.restaurant_name,
          city: dish.city,
          price: `₹${dish.price}`,
          protein: dish.protein_content,
          taste: dish.taste,
          satisfaction: dish.satisfaction,
          comment: dish.comment,
          addedBy: dish.users?.name || "Unknown",
          addedByProfilePicture: dish.users?.profile_picture_url || null,
          availability: dish.availability as "In-Store" | "Online" | "Both",
          image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
          protein_source: dish.protein_source,
          delivery_apps: dish.delivery_apps || [],
          place_id: dish.place_id,
          users: dish.users,
          restaurant: dish.restaurant,
          hasInStore: dish.hasInStore,
          deliveryApps: dish.deliveryApps || dish.delivery_apps || []
        }))
        setDishes(transformedDishes)
      } else {
        throw new Error('Failed to fetch dishes for selected city')
      }
    } catch (error) {
      console.error('Error fetching dishes for city:', error)
      setError('Failed to load dishes for selected city')
    } finally {
      setLoading(false)
    }
  }

  // NEW: Handle "Be the first" action
  const handleBeFirst = () => {
    setIsBeFirstModalOpen(false)
    window.location.href = '/signup'
  }

  // Helper function for fallback city extraction
  const getCitiesFromDishes = (dishes: Dish[]) => {
    const cityCounts = dishes.reduce((acc, dish) => {
      acc[dish.city] = (acc[dish.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, dishCount: count }))
      .sort((a, b) => b.dishCount - a.dishCount)
  }

  // Distance calculation function using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  // Helper function to parse price string and return numeric value
  const parsePrice = (p: string | undefined): number => {
        if (!p) return NaN
        const n = Number(String(p).replace(/[^0-9.]/g, ""))
        return isNaN(n) ? NaN : n
      }

  // Helper function to compare prices based on user's sort preference
  const comparePrices = (a: Dish, b: Dish, sortType: string): number => {
      const pa = parsePrice(a.price)
      const pb = parsePrice(b.price)

    if (sortType === "low-to-high") {
        const va = isNaN(pa) ? Number.POSITIVE_INFINITY : pa
        const vb = isNaN(pb) ? Number.POSITIVE_INFINITY : pb
        return va - vb
    } else if (sortType === "high-to-low") {
        const va = isNaN(pa) ? Number.NEGATIVE_INFINITY : pa
        const vb = isNaN(pb) ? Number.NEGATIVE_INFINITY : pb
        return vb - va
      }
    
    // Default to low-to-high if no valid sort type
    const va = isNaN(pa) ? Number.POSITIVE_INFINITY : pa
    const vb = isNaN(pb) ? Number.POSITIVE_INFINITY : pb
    return va - vb
  }

  // Handle sort selection
  const handleSortChange = (value: string) => {
    setSortBy(value)
    
    // If user selects any option that requires distance, request location permission
    if ((value === 'nearest' || value === 'nearest-cheapest' || value === 'nearest-expensive') && 
        !locationPermissionGranted && !locationLoading) {
      requestLocationPermission()
    }
  }

  const filteredDishes = useMemo(() => {
    // First filter dishes by city and protein
    let filtered = dishes.filter((dish) => {
      const cityMatch = user 
        ? dish.city === userCity 
        : dish.city === selectedCity
      const proteinMatch = selectedProteinFilter === "All" || dish.protein_source === selectedProteinFilter
      return cityMatch && proteinMatch
    })

    // Always calculate distances when location is available (for display purposes)
    if (userLocation && userLocation.lat && userLocation.lng) {
      filtered = filtered.map((dish) => {
        if (dish.restaurant?.latitude && dish.restaurant?.longitude && !dish.restaurant?.is_cloud_kitchen) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            dish.restaurant.latitude,
            dish.restaurant.longitude
          )
          return { ...dish, distance }
        }
        return dish
      })
    }

    // Sort the filtered dishes based on selected sort option
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nearest':
          // Only show and sort by distance - filter out restaurants without coordinates
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance
          }
          // If one has distance and other doesn't, prioritize the one with distance
          if (a.distance !== undefined && b.distance === undefined) return -1
          if (a.distance === undefined && b.distance !== undefined) return 1
          return 0
          
        case 'cheapest':
          return comparePrices(a, b, "low-to-high")
          
        case 'nearest-cheapest':
          // Sort by nearest first, then cheapest for equal distances
          if (a.distance !== undefined && b.distance !== undefined) {
            const distanceDiff = a.distance - b.distance
            if (distanceDiff !== 0) return distanceDiff
            return comparePrices(a, b, "low-to-high")
          }
          // If one has distance and other doesn't, prioritize distance
          if (a.distance !== undefined && b.distance === undefined) return -1
          if (a.distance === undefined && b.distance !== undefined) return 1
          // If neither has distance, fall back to cheapest
          return comparePrices(a, b, "low-to-high")
          
        case 'nearest-expensive':
          // Sort by nearest first, then most expensive for equal distances
          if (a.distance !== undefined && b.distance !== undefined) {
            const distanceDiff = a.distance - b.distance
            if (distanceDiff !== 0) return distanceDiff
            return comparePrices(a, b, "high-to-low")
          }
          // If one has distance and other doesn't, prioritize distance
          if (a.distance !== undefined && b.distance === undefined) return -1
          if (a.distance === undefined && b.distance !== undefined) return 1
          // If neither has distance, fall back to most expensive
          return comparePrices(a, b, "high-to-low")
          
        default:
          return 0
      }
    })
  }, [dishes, user, userCity, selectedCity, selectedProteinFilter, sortBy, userLocation])

  const proteinCategories: { label: string; value: ProteinSource }[] = [
    { label: "All", value: "All" },
    { label: "🐔 Chicken", value: "Chicken" },
    { label: "🐟 Fish", value: "Fish" },
    { label: "🧀 Paneer", value: "Paneer" },
    { label: "🌱 Tofu", value: "Tofu" },
    { label: "🥚 Eggs", value: "Eggs" },
    { label: "🐑 Mutton/Lamb", value: "Mutton" },
    { label: "🥩 Beef", value: "Beef" },
    { label: "🍽️ Other", value: "Other" },
  ]

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Hey {userName}! 👋</h1>
          {user ? (
            <p className="text-xl text-muted-foreground">
              Discover high-protein meals in {userCity}
            </p>
          ) : (
            <div className="text-xl text-muted-foreground">
              {loadingCities ? (
                "Loading cities..."
              ) : (
                <InlineCitySelector
                  selectedCity={selectedCity}
                  onCityChange={handleCityChange}
                  cities={citiesWithDishes}
                  onBeFirstClick={() => setIsBeFirstModalOpen(true)}
                />
              )}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {proteinCategories.map((category) => (
              <Button
                key={category.value}
                variant={selectedProteinFilter === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProteinFilter(category.value)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-64">
            <Select 
              value={sortBy} 
              onValueChange={handleSortChange}
              disabled={locationLoading && (sortBy === 'nearest' || sortBy === 'nearest-cheapest' || sortBy === 'nearest-expensive')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Sort by</SelectItem>
                <SelectItem value="nearest">
                  {locationLoading ? "Getting Location..." : 
                   locationPermissionGranted ? "Nearest" : 
                   "Nearest (Enable Location)"}
                </SelectItem>
                <SelectItem value="cheapest">Cheapest</SelectItem>
                <SelectItem value="nearest-cheapest">
                  {locationLoading ? "Getting Location..." : 
                   locationPermissionGranted ? "Nearest & Cheapest" : 
                   "Nearest & Cheapest (Enable Location)"}
                </SelectItem>
                <SelectItem value="nearest-expensive">
                  {locationLoading ? "Getting Location..." : 
                   locationPermissionGranted ? "Nearest & Most Expensive" : 
                   "Nearest & Most Expensive (Enable Location)"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dishes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <p className="text-muted-foreground">Using sample data for now.</p>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                id={dish.id}
                dishName={dish.dish_name}
                restaurantName={dish.restaurant_name}
                city={dish.city}
                price={dish.price}
                protein={dish.protein}
                taste={dish.taste}
                satisfaction={dish.satisfaction}
                comment={dish.comment}
                addedBy={dish.addedBy}
                addedByProfilePicture={dish.addedByProfilePicture}
                imageUrl={dish.image_url}
                // New restaurant-centric props
                restaurant={dish.restaurant}
                hasInStore={dish.hasInStore}
                deliveryApps={dish.deliveryApps}
                // Legacy props for backward compatibility
                availability={dish.availability}
                proteinSource={dish.protein_source}
                placeId={dish.place_id}
                isBookmarked={bookmarkedDishes.has(dish.id)}
                onBookmarkToggle={handleBookmarkToggle}
                showActions={false}
                distance={dish.distance}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {user 
                ? `No dishes found in ${userCity}.`
                : `No dishes found.`
              }
            </p>
            <p className="text-muted-foreground mb-4">
              {user 
                ? "Try adjusting your filters or be the first to add a dish!"
                : "Be the first to contribute!"
              }
            </p>
            {!user && (
              <Button onClick={() => setIsBeFirstModalOpen(true)}>
                Request Invite Code
              </Button>
            )}
          </div>
        )}

        {/* Be the First Modal */}
        <BeFirstModal
          isOpen={isBeFirstModalOpen}
          onClose={() => setIsBeFirstModalOpen(false)}
          selectedCity={selectedCity}
        />
      </div>
    </MainLayout>
  )
}
