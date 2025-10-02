"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Search, MapPin, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGooglePlaces } from "@/lib/hooks/use-google-places"
import { RestaurantResult } from "@/lib/hooks/use-google-places"
import { cn } from "@/lib/utils"

interface RestaurantSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (restaurant: RestaurantResult) => void
  userCity: string
  userLocation: { lat: number; lng: number } | null
  disabled?: boolean
  className?: string
}

export function RestaurantSearchInput({
  value,
  onChange,
  onSelect,
  userCity,
  userLocation,
  disabled = false,
  className,
}: RestaurantSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResult | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0})
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const {
    googleMapsLoaded,
    searchRestaurants,
    getAutocompletePredictions,
    loading: googleMapsLoading,
  } = useGooglePlaces({ userCity, userLocation })

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [])

  // Debounced search function
  const debouncedSearch = async (query: string) => {
    console.log('🔍 RestaurantSearchInput: Starting debounced search for:', query)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      console.log('🔍 RestaurantSearchInput: Executing search', { query, googleMapsLoaded });
      
      if (!query.trim() || !googleMapsLoaded) {
        console.log('❌ RestaurantSearchInput: Aborting search - empty query or Google Maps not loaded');
        setPredictions([])
        return
      }

      setLoading(true)
      console.log('📡 RestaurantSearchInput: Making API call for:', query);
      
      try {
        const autocompletePredictions = await getAutocompletePredictions(query)
        console.log('📥 RestaurantSearchInput: Received predictions:', autocompletePredictions.length);
        setPredictions(autocompletePredictions)
      } catch (error) {
        console.error('❌ RestaurantSearchInput: Autocomplete search failed:', error)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }


  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    onChange(query)
    
    if (!selectedRestaurant || selectedRestaurant.name !== query) {
      setSelectedRestaurant(null)
    }
    
    if (query.trim()) {
      calculateDropdownPosition()
      setIsOpen(true)
      debouncedSearch(query)
    } else {
      setIsOpen(false)
      setPredictions([])
    }
  }

  // Handle restaurant selection from autocomplete
  const handleRestaurantSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    const inputValue = prediction.description
    onChange(inputValue)
    setIsOpen(false)
    setPredictions([])

    // Perform detailed search to get complete restaurant data
    try {
      setLoading(true)
      const restaurants = await searchRestaurants(prediction.structured_formatting.main_text)
      
      // Find the matching restaurant by place_id or best match by name
      const matchingRestaurant = restaurants.find(r => 
        r.place_id === prediction.place_id || 
        r.name.toLowerCase().includes(prediction.structured_formatting.main_text.toLowerCase())
      )

      if (matchingRestaurant) {
        setSelectedRestaurant(matchingRestaurant)
        onSelect(matchingRestaurant)
      } else if (restaurants.length > 0) {
        // Use the first result if exact match not found
        setSelectedRestaurant(restaurants[0])
        onSelect(restaurants[0])
      }
    } catch (error) {
      console.error('Failed to get restaurant details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle manual search (when user presses Enter or clicks search)
  const handleManualSearch = async () => {
    if (!value.trim() || !googleMapsLoaded) return

    try {
      setLoading(true)
      const restaurants = await searchRestaurants(value)
      
      if (restaurants.length > 0) {
        const bestRestaurant = restaurants[0]
        setSelectedRestaurant(bestRestaurant)
        onSelect(bestRestaurant)
      }
      
      setIsOpen(false)
      setPredictions([])
    } catch (error) {
      console.error('Manual search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && predictions.length > 0) {
        handleRestaurantSelect(predictions[0])
      } else {
        handleManualSearch()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setPredictions([])
    }
  }

  if (googleMapsLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="restaurant">Restaurant Name</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Loading Google Maps..."
            disabled
            className="pl-10"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="restaurant">Restaurant Name</Label>
      <div className="relative" ref={inputRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          id="restaurant"
          type="text"
          placeholder="Search for restaurant"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`pl-10 ${value && !selectedRestaurant ? 'pr-20' : ''}`}
          disabled={disabled}
          required
        />
        {value && !selectedRestaurant && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-3 text-xs"
            onClick={handleManualSearch}
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </Button>
        )}
      </div>




      {/* Search Results Dropdown - Portal */}
      {isOpen && (predictions.length > 0 || loading) && createPortal(
        <Card 
          className="absolute z-[9999] border shadow-lg bg-background"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
          }}
        >
          <CardContent className="p-1">
            {loading ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Search className="w-4 h-4 mr-2 animate-pulse" />
                Searching restaurants...
              </div>
            ) : predictions.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.place_id || index}
                    type="button"
                    className="w-full p-3 text-left hover:bg-muted/50 rounded-sm transition-colors"
                    onClick={() => handleRestaurantSelect(prediction)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-words">
                          {prediction.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-muted-foreground break-words">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : value.length > 2 ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mr-2" />
                No restaurants found. Try a different search term.
              </div>
            ) : null}
          </CardContent>
        </Card>,
        document.body
      )}

      {/* Selected Restaurant Display */}
      {selectedRestaurant && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{selectedRestaurant.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {selectedRestaurant.formatted_address}
              </div>
              {selectedRestaurant.rating && (
                <div className="text-xs text-muted-foreground mt-1">
                  ⭐ {selectedRestaurant.rating}/5 
                  {selectedRestaurant.user_ratings_total && (
                    <span className="ml-1">({selectedRestaurant.user_ratings_total} reviews)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Status */}
      {userLocation && (
        <div className="text-xs text-muted-foreground">
          🔍 Searching restaurants near your location
        </div>
      )}
      
      {!userLocation && userCity && (
        <div className="text-xs text-muted-foreground">
          🔍 Searching restaurants in {userCity}
        </div>
      )}
    </div>
  )
}
