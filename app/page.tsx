"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useSession } from "@/lib/auth/session-provider"
import { InlineCitySelector } from "@/components/ui/inline-city-selector"
import { BeFirstModal } from "@/components/ui/be-first-modal"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { useDishesCache } from "@/lib/cache/dishes-cache-provider"


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
  const [distanceRange, setDistanceRange] = useState("whole-city")
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
  const { getCachedDishes, setCachedDishes, getFilters, setFilters, getScrollPosition, setScrollPosition } = useDishesCache()
  const hasRestoredScroll = useRef(false)

  // Use SessionProvider data instead of fetching separately
  useEffect(() => {
    if (userProfile) {
      setUserCity(userProfile.city || "Pune, India")
      setUserName(userProfile.name?.split(' ')[0] || "User")
      setLoadingProfile(false)
    } else if (user === null) {
      // For unauthenticated users, set default values and stop loading
      setUserName("gym bud")
      setUserCity("Pune, India")
      setLoadingProfile(false)
    }
  }, [userProfile, user])

  // Restore cached filters on mount
  useEffect(() => {
    const cachedFilters = getFilters()
    if (cachedFilters) {
      console.log('📦 Restoring cached filters:', cachedFilters)
      setSelectedProteinFilter(cachedFilters.proteinSource)
      setSortBy(cachedFilters.sortBy)
      setDistanceRange(cachedFilters.distanceRange)
    }
  }, [getFilters])

  // Save filters to cache whenever they change
  useEffect(() => {
    setFilters({
      proteinSource: selectedProteinFilter,
      sortBy,
      distanceRange
    })
  }, [selectedProteinFilter, sortBy, distanceRange, setFilters])

  // Save scroll position before unmount
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      // Save final scroll position on unmount
      setScrollPosition(window.scrollY)
    }
  }, [setScrollPosition])

  // Restore scroll position after dishes are loaded
  useEffect(() => {
    if (dishes.length > 0 && !loading && !hasRestoredScroll.current) {
      const cachedScrollPosition = getScrollPosition()
      if (cachedScrollPosition > 0) {
        console.log('📜 Restoring scroll position:', cachedScrollPosition)
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          window.scrollTo(0, cachedScrollPosition)
          hasRestoredScroll.current = true
        }, 100)
      }
    }
  }, [dishes, loading, getScrollPosition])

  // NEW: Load data with parallel API calls for non-authenticated users
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentCity = user ? userCity : selectedCity
        
        // Check cache first
        const cachedDishes = getCachedDishes(currentCity)
        if (cachedDishes) {
          console.log('✅ Using cached dishes for', currentCity, '- Count:', cachedDishes.length)
          setDishes(cachedDishes)
          setLoading(false)
          setLoadingCities(false)
          return
        }

        console.log('🔄 Cache miss - fetching fresh dishes for', currentCity)
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
        setCachedDishes(userCity, transformedDishes)
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
            setCachedDishes(selectedCity, transformedDishes)
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
  }, [user, userCity, selectedCity, getCachedDishes, setCachedDishes]) // Cache-aware dependencies

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
    // Redirect non-logged-in users to signup
    if (!user) {
      window.location.href = '/signup'
      return
    }

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
    
    // If user selects nearest and location is not available, request permission
    if (value === 'nearest' && !locationPermissionGranted && !locationLoading) {
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

    // Calculate distances when location is available
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

    // Filter by distance range if location is available and range is not "whole-city"
    if (distanceRange !== "whole-city" && userLocation) {
      const maxDistance = parseInt(distanceRange)
      filtered = filtered.filter(dish => 
        dish.distance !== undefined && dish.distance <= maxDistance
      )
    }

    // Sort the filtered dishes based on selected sort option
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nearest':
          return (a.distance || Infinity) - (b.distance || Infinity)
          
        case 'cheapest':
          return parsePrice(a.price) - parsePrice(b.price)
          
        case 'most-expensive':
          return parsePrice(b.price) - parsePrice(a.price)
          
        default:
          return 0
      }
    })
  }, [dishes, user, userCity, selectedCity, selectedProteinFilter, sortBy, distanceRange, userLocation])

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

  const distanceRanges = [
    { value: "2", label: "Within 2 km" },
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "25", label: "Within 25 km" },
    { value: "50", label: "Within 50 km" },
    { value: "whole-city", label: "Whole City" }
  ]

  const sortOptions = [
    { value: "nearest", label: "Nearest" },
    { value: "cheapest", label: "Cheapest" },
    { value: "most-expensive", label: "Most Expensive" }
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

        <div className="flex flex-row items-center gap-3 mb-8">
          {/* Distance Range Selector */}
          <div className="flex-1">
            <Select 
              value={distanceRange} 
              onValueChange={(value) => {
                if (value !== "whole-city" && !userLocation) {
                  requestLocationPermission()
                } else {
                  setDistanceRange(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={userLocation ? "Search within" : "Enable location to search by distance"} />
              </SelectTrigger>
              <SelectContent>
                {distanceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Selector */}
          <div className="flex-1">
            <Select 
              value={sortBy} 
              onValueChange={handleSortChange}
              disabled={locationLoading && sortBy === 'nearest'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort dishes by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Sort dishes by</SelectItem>
                {sortOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.value === 'nearest' && locationLoading ? "Getting Location..." : 
                     option.value === 'nearest' && !locationPermissionGranted ? "Nearest (Enable Location)" : 
                     option.label}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location Permission Denied Message */}
        {!userLocation && locationPermissionRequested && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Location access was denied
                </p>
                <p className="text-xs text-red-700 mt-1">
                  To enable location access: Go to your browser settings → Site Settings → Location → Allow for this website
                </p>
              </div>
            </div>
          </div>
        )}

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
          <>
            {/* Results Count Display */}
            {/* <div className="mb-6">
              <p className="text-muted-foreground">
                {userLocation && distanceRange !== "whole-city" ? (
                  <>
                    {filteredDishes.length} dishes found within {distanceRange} km
                    {sortBy !== "default" && `, sorted by ${sortOptions.find(opt => opt.value === sortBy)?.label.toLowerCase()}`}
                  </>
                ) : (
                  <>
                    {filteredDishes.length} dishes found
                    {sortBy !== "default" && `, sorted by ${sortOptions.find(opt => opt.value === sortBy)?.label.toLowerCase()}`}
                  </>
                )}
              </p>
            </div> */}

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
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {userLocation && distanceRange !== "whole-city" ? (
                `No dishes found within ${distanceRange} km.`
              ) : user ? (
                `No dishes found in ${userCity}.`
              ) : (
                `No dishes found.`
              )}
            </p>
            {userLocation && distanceRange !== "whole-city" && (
              <p className="text-muted-foreground mb-4">
                Try expanding your search to see more dishes.
              </p>
            )}
            <p className="text-muted-foreground mb-4">
              {user 
                ? "Try adjusting your filters or be the first to add a dish!"
                : "Contribute to Hypertropher."
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
