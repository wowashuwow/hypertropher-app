"use client"

import { useState } from "react"
import { Bookmark, Link, MapPin, ChevronDown, ChevronUp, Edit, Trash2, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/clipboard"
import { getDeepLinkUrl, getWebFallbackUrl } from "@/lib/deep-links"
import { getDeliveryAppLogo } from "@/lib/delivery-apps"

interface DishCardProps {
  id: string
  dishName: string
  restaurantName: string
  city: string
  imageUrl?: string
  price: string
  protein: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction?: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  addedBy: string
  addedByProfilePicture?: string | null
  // Legacy props for backward compatibility
  availability?: "Online" | "In-Store" | "Both"
  proteinSource?: string
  deliveryApps?: string[]
  placeId?: string | null
  // New props for restaurant-centric approach
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
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  distance?: number
}

export function DishCard({
  id,
  dishName,
  restaurantName,
  city,
  imageUrl = "/delicious-high-protein-meal.jpg",
  price,
  protein,
  taste,
  satisfaction = "Pretty Good",
  comment,
  addedBy,
  addedByProfilePicture,
  // Legacy props
  availability,
  proteinSource,
  deliveryApps = [],
  placeId,
  // New props
  restaurant,
  hasInStore,
  isBookmarked = false,
  onBookmarkToggle,
  showActions = false,
  onEdit,
  onDelete,
  distance,
}: DishCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copyingStates, setCopyingStates] = useState<Record<string, boolean>>({})

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked)
    onBookmarkToggle?.(id)
  }

  // Determine availability and navigation data
  const currentPlaceId = restaurant?.place_id || placeId
  const currentRestaurantName = restaurant?.name || restaurantName
  const isCloudKitchen = restaurant?.is_cloud_kitchen || false
  const hasGoogleMapsData = restaurant?.source_type === 'google_maps' && currentPlaceId
  const hasOnlineAvailability = deliveryApps && deliveryApps.length > 0
  const hasInStoreAvailability = hasInStore !== undefined ? hasInStore : (availability === 'In-Store' || availability === 'Both')
  
  // Determine availability display
  const getAvailabilityInfo = () => {
    if (hasInStoreAvailability && hasOnlineAvailability) {
      return { type: 'both', label: 'In-Store + Online' }
    } else if (hasInStoreAvailability) {
      return { type: 'in-store', label: 'In-Store' }
    } else if (hasOnlineAvailability) {
      return { type: 'online', label: 'Online' }
    } else {
      // Fallback to legacy availability
      return { type: availability?.toLowerCase() || 'unknown', label: availability || 'Unknown' }
    }
  }

  const availabilityInfo = getAvailabilityInfo()

  // Format distance display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const handleNavigate = () => {
    if (hasGoogleMapsData) {
      // Open restaurant page using Google Maps URL API - requires both query and query_place_id per docs
      const encodedRestaurantName = encodeURIComponent(currentRestaurantName)
      const restaurantPageUrl = `https://www.google.com/maps/search/?api=1&query=${encodedRestaurantName}&query_place_id=${currentPlaceId}`
      window.open(restaurantPageUrl, '_blank')
      toast.success(`Opening ${currentRestaurantName} in Google Maps`)
    } else {
      toast.error("Location data not available for this restaurant")
    }
  }


  const handleDeliveryAppClick = async (appName: string) => {
    // Set copying state for this specific app
    setCopyingStates(prev => ({ ...prev, [appName]: true }))
    
    try {
      // Copy restaurant name to clipboard first
      const copySuccess = await copyToClipboard(restaurantName)
      
      if (copySuccess) {
        toast.success(`Copied "${restaurantName}" to clipboard`)
      } else {
        toast.error("Failed to copy restaurant name")
      }
      
      // Delay deep link trigger by 1 second to allow user to see the toast
      const deepLink = getDeepLinkUrl(appName)
      const webUrl = getWebFallbackUrl(appName)
      
      // Wait 1 second for user to see toast, then trigger deep link
      setTimeout(() => {
        try {
          window.location.href = deepLink
          // If deep link fails, fallback to web URL after another 1 second
          setTimeout(() => {
            window.open(webUrl, '_blank')
          }, 1000)
        } catch (error) {
          // If deep link fails immediately, open web URL
          window.open(webUrl, '_blank')
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error in handleDeliveryAppClick:', error)
      toast.error("Something went wrong")
    } finally {
      // Clear copying state for this app
      setCopyingStates(prev => ({ ...prev, [appName]: false }))
    }
  }

  const toggleExpanded = () => {
    if (comment && comment.trim().length > 0) {
      setIsExpanded(!isExpanded)
    }
  }

  const getProteinEmojis = (protein: string) => {
    return protein === "Overloaded" ? "💪💪💪" : "👍"
  }

  const getTasteEmojis = (taste: string) => {
    return taste === "Mouthgasm" ? "🤤🤤🤤" : "👍"
  }

  const getSatisfactionEmojis = (satisfaction: string) => {
    return satisfaction === "Would Eat Everyday" ? "🤩🤩🤩" : "👍"
  }


  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full">
      {/* Image Section */}
      <div className="aspect-[4/5] relative">
        <img src={imageUrl || "/placeholder.svg"} alt={dishName} className="w-full h-full object-cover" />
        <button
          onClick={handleBookmarkClick}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md"
        >
          <Bookmark className={cn("w-4 h-4", bookmarked ? "fill-primary text-primary" : "text-gray-600")} />
        </button>
      </div>

      {/* Content Section - Flexible */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-0.5 gap-2">
          <h2 className="text-lg font-semibold text-card-foreground leading-tight">{dishName}</h2>
          <div className="flex flex-wrap gap-1 self-start">
            {/* Distance or Cloud Kitchen indicator */}
            {isCloudKitchen ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-green-100 text-green-800">
                <Cloud className="h-3 w-3" />
                Cloud Kitchen
              </span>
            ) : distance !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-800">
                <MapPin className="h-3 w-3" />
                {formatDistance(distance)}
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {restaurantName} · {city}
        </p>

        <div className="space-y-1.5 mb-3 flex-grow">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cost</span>
            <span className="font-medium">{price}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Protein</span>
            <span className="font-medium">{getProteinEmojis(protein)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taste</span>
            <span className="font-medium">{getTasteEmojis(taste)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Satisfaction</span>
            <span className="font-medium">{getSatisfactionEmojis(satisfaction)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {addedByProfilePicture ? (
            <img
              src={addedByProfilePicture}
              alt={`${addedBy}'s profile`}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className={`w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ${
              addedByProfilePicture ? 'hidden' : ''
            }`}
          >
            <span className="text-white text-xs font-semibold">{addedBy.charAt(0)}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">Added by {addedBy}</p>
        </div>
      </div>

      {/* Action Section - Fixed Bottom */}
      <div className="p-4 pt-0 space-y-3 mt-auto">
        {/* Action buttons based on availability */}
        {availabilityInfo.type === 'both' ? (
          <div className="space-y-2">
            {/* In-Store button */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 flex items-center justify-center gap-2"
              onClick={handleNavigate}
              disabled={!hasGoogleMapsData}
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Open in Google Maps</span>
            </Button>
            
            {/* Delivery apps buttons */}
            {deliveryApps && deliveryApps.length > 0 && (
              <div className="space-y-1">
                {deliveryApps.map((app) => (
                  <Button 
                    key={app}
                    onClick={() => handleDeliveryAppClick(app)}
                    disabled={copyingStates[app]}
                    className={cn(
                      "w-full bg-green-600 hover:bg-green-700 text-white border-0 text-sm flex items-center justify-center gap-2",
                      copyingStates[app] && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    <img 
                      src={getDeliveryAppLogo(app)} 
                      alt={`${app} logo`}
                      className="h-4 w-4 flex-shrink-0 rounded-[3px]"
                      onError={(e) => {
                        e.currentTarget.src = "/logos/placeholder.svg"
                      }}
                    />
                    <span className="truncate">
                      {copyingStates[app] ? "Copying..." : `Check on ${app}`}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : availabilityInfo.type === 'online' && deliveryApps && deliveryApps.length > 0 ? (
          <div className="space-y-2">
            {deliveryApps.map((app) => (
              <Button 
                key={app}
                onClick={() => handleDeliveryAppClick(app)}
                disabled={copyingStates[app]}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white border-0 text-sm flex items-center justify-center gap-2",
                  copyingStates[app] && "opacity-75 cursor-not-allowed"
                )}
              >
                <img 
                  src={getDeliveryAppLogo(app)} 
                  alt={`${app} logo`}
                  className="h-4 w-4 flex-shrink-0 rounded-[3px]"
                  onError={(e) => {
                    e.currentTarget.src = "/logos/placeholder.svg"
                  }}
                />
                <span className="truncate">
                  {copyingStates[app] ? "Copying..." : `Check on ${app}`}
                </span>
              </Button>
            ))}
          </div>
        ) : availabilityInfo.type === 'online' ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white border-0 flex items-center justify-center gap-2"
            disabled
          >
            <img 
              src="/logos/placeholder.svg" 
              alt="Online delivery"
              className="h-4 w-4 flex-shrink-0"
            />
            <span>Online</span>
          </Button>
        ) : (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 flex items-center justify-center gap-2"
            onClick={handleNavigate}
            disabled={!hasGoogleMapsData}
          >
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>Open in Google Maps</span>
          </Button>
        )}
        
        {/* Edit/Delete Actions - Only show when showActions is true */}
        {showActions && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(id)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
        
        {/* Modern expand button for comments */}
        {comment && comment.trim().length > 0 && (
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 border border-transparent hover:border-border"
          >
            <span>{isExpanded ? "Hide" : "Show"} comment</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            )}
          </button>
        )}
      </div>
      
      {/* Comment Overlay Tray - Slides up from bottom with 3D effects */}
      {comment && comment.trim().length > 0 && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-b from-background/95 to-background/98 border-t border-border transition-all duration-200 ease-out z-10",
          // Apply custom 3D effects class
          "comment-tray-3d",
          // Animation states
          isExpanded 
            ? "translate-y-0" 
            : "translate-y-full"
        )}>
          {/* Close button inside overlay */}
          <div className="px-4 pt-4">
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 border border-transparent hover:border-border"
            >
              <span>Close comment</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-3 shadow-sm relative">
              {/* Profile picture positioned absolutely at top-left */}
              <div className="absolute -top-2 -left-2">
                {addedByProfilePicture ? (
                  <img 
                    src={addedByProfilePicture} 
                    alt={`${addedBy}'s profile`}
                    className="w-6 h-6 rounded-full object-cover border-2 border-background shadow-sm"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-background shadow-sm ${
                    addedByProfilePicture ? 'hidden' : ''
                  }`}
                >
                  <span className="text-white text-xs font-semibold">{addedBy.charAt(0)}</span>
                </div>
              </div>
              
              {/* Comment text with left padding to accommodate profile picture */}
              <div className="pl-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {comment}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
