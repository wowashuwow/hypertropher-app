"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Plus, AlertCircle, MapPinIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RestaurantSearchInput } from "./restaurant-search-input"
import type { RestaurantInput } from "@/types/restaurant"
import { RestaurantResult } from "@/lib/hooks/use-google-places"
import { cn } from "@/lib/utils"

interface RestaurantInputProps {
  value: RestaurantInput | null
  onChange: (value: RestaurantInput | null) => void
  userCity: string
  userLocation: { lat: number; lng: number } | null
  disabled?: boolean
  className?: string
  // Location permission props
  locationPermissionGranted?: boolean
  locationPermissionRequested?: boolean
  locationError?: string | null
  onRequestLocationPermission?: () => void
}

export function RestaurantInput({
  value,
  onChange,
  userCity,
  userLocation,
  disabled = false,
  className,
  locationPermissionGranted = false,
  locationPermissionRequested = false,
  locationError = null,
  onRequestLocationPermission,
}: RestaurantInputProps) {
  const [isManualEntry, setIsManualEntry] = useState(value?.type === 'manual')
  const [selectedGoogleMapsRestaurant, setSelectedGoogleMapsRestaurant] = useState<RestaurantResult | null>(
    value?.type === 'google_maps' && value.googleMapsData
      ? {
          place_id: value.googleMapsData.place_id,
          name: value.googleMapsData.name,
          formatted_address: value.googleMapsData.formatted_address,
          geometry: {
            location: {
              lat: value.googleMapsData.geometry.location.lat,
              lng: value.googleMapsData.geometry.location.lng,
            },
          },
        }
      : null
  )
  const [inputValue, setInputValue] = useState(
    value?.type === 'google_maps' && value.googleMapsData ? value.googleMapsData.name : ''
  )
  const [manualData, setManualData] = useState({
    name: value?.type === 'manual' && value.manualData ? value.manualData.name : '',
  })

  // Update parent component when selection changes
  useEffect(() => {
    if (isManualEntry) {
      onChange({ type: 'manual', manualData: { name: manualData.name, isCloudKitchen: true } })
    } else {
      if (selectedGoogleMapsRestaurant) {
        onChange({
          type: 'google_maps',
          googleMapsData: {
            place_id: selectedGoogleMapsRestaurant.place_id,
            name: selectedGoogleMapsRestaurant.name,
            formatted_address: selectedGoogleMapsRestaurant.formatted_address,
            geometry: {
              location: {
                lat: selectedGoogleMapsRestaurant.geometry.location.lat,
                lng: selectedGoogleMapsRestaurant.geometry.location.lng,
              },
            },
          },
        })
      } else {
        onChange(null)
      }
    }
  }, [isManualEntry, selectedGoogleMapsRestaurant, manualData, onChange])

  const handleGoogleMapsSelect = (result: RestaurantResult | null) => {
    setSelectedGoogleMapsRestaurant(result)
    if (result) {
      setInputValue(result.name)
    }
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    // Clear selected restaurant when user manually edits
    if (selectedGoogleMapsRestaurant && selectedGoogleMapsRestaurant.name !== newValue) {
      setSelectedGoogleMapsRestaurant(null)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-semibold">Select Restaurant *</Label>
      
      {/* Location Permission Request */}
      {!isManualEntry && !locationPermissionGranted && !locationPermissionRequested && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Find restaurants near you
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Allow location access to see restaurants ranked by distance from your current location.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onRequestLocationPermission}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={disabled}
              >
                Allow Location Access
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Status Messages */}
      {!isManualEntry && locationPermissionRequested && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Location Access Denied</p>
              <p className="text-xs mt-1">
                No problem! We'll search restaurants in {userCity} instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isManualEntry && locationPermissionGranted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Location Access Granted</p>
              <p className="text-xs mt-1">
                Searching restaurants near your location for better results.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isManualEntry ? (
        <div className="space-y-3">
          <RestaurantSearchInput
            value={inputValue}
            onChange={handleInputChange}
            onSelect={handleGoogleMapsSelect}
            userCity={userCity}
            userLocation={userLocation}
            disabled={disabled}
          />
          
          {selectedGoogleMapsRestaurant && (
            <div className="p-3 border border-border rounded-md bg-background">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{selectedGoogleMapsRestaurant.name}</p>
                  <p className="text-muted-foreground text-xs">{selectedGoogleMapsRestaurant.formatted_address}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsManualEntry(true)}
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Can't find the restaurant? Must be a cloud kitchen. Add it manually.
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Manual Entry</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsManualEntry(false)}
              disabled={disabled}
            >
              Search on Google Maps instead
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-restaurant-name">Restaurant Name *</Label>
              <Input
                id="manual-restaurant-name"
                value={manualData.name}
                onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter restaurant name"
                required
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Cloud Kitchen</p>
                <p className="text-xs mt-1">
                  This restaurant will be automatically set as delivery-only (cloud kitchen).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}