"use client"

import { useState } from "react"
import { Bookmark, Link, MapPin, ChevronDown, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DishCardProps {
  id: string
  dishName: string
  restaurantName: string
  city: string
  imageUrl?: string
  price: string
  protein: "💪 Overloaded" | "👍 Great"
  taste: "🤤 Amazing" | "👍 Great"
  satisfaction?: "🤩 Would Eat Everyday" | "👍 Great"
  comment?: string
  addedBy: string
  availability: "Online" | "In-Store"
  proteinSource?: string
  deliveryApps?: string[]
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
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
  satisfaction = "👍 Great",
  comment,
  addedBy,
  availability,
  proteinSource,
  deliveryApps = [],
  isBookmarked = false,
  onBookmarkToggle,
  showActions = false,
  onEdit,
  onDelete,
}: DishCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked)
    onBookmarkToggle?.(id)
  }

  const getDeepLinkUrl = (appName: string) => {
    const deepLinks = {
      'Swiggy': 'swiggy://',
      'Zomato': 'zomato://',
      'Uber Eats': 'ubereats://',
      'DoorDash': 'doordash://'
    }
    return deepLinks[appName as keyof typeof deepLinks] || `https://${appName.toLowerCase().replace(' ', '')}.com`
  }

  const getWebFallbackUrl = (appName: string) => {
    const webUrls = {
      'Swiggy': 'https://www.swiggy.com',
      'Zomato': 'https://www.zomato.com',
      'Uber Eats': 'https://www.ubereats.com',
      'DoorDash': 'https://www.doordash.com'
    }
    return webUrls[appName as keyof typeof webUrls] || `https://${appName.toLowerCase().replace(' ', '')}.com`
  }

  const handleDeliveryAppClick = (appName: string) => {
    const webUrl = getWebFallbackUrl(appName)
    
    // Simply open the web URL directly on desktop
    // On mobile, users can install the app from the website
    window.open(webUrl, '_blank')
  }

  const toggleExpanded = () => {
    if (comment && comment.trim().length > 0) {
      setIsExpanded(!isExpanded)
    }
  }

  const getProteinEmojis = (protein: string) => {
    return protein === "Overloaded" ? "💪" : "👍"
  }

  const getTasteEmojis = (taste: string) => {
    return taste === "Amazing" ? "🤤" : "👍"
  }

  const getSatisfactionEmojis = (satisfaction: string) => {
    const emojiMap = { "Would Eat Everyday": "🤩", Great: "👍" }
    return emojiMap[satisfaction as keyof typeof emojiMap] || "👍"
  }


  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md relative flex flex-col h-full">
      {/* Image Section */}
      <div className="aspect-[4/5] relative">
        <img src={imageUrl || "/placeholder.svg"} alt={dishName} className="w-full h-full object-cover" />
        <button
          onClick={handleBookmarkClick}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Bookmark className={cn("w-5 h-5", bookmarked ? "fill-primary text-primary" : "text-gray-600")} />
        </button>
      </div>

      {/* Content Section - Flexible */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h2 className="text-xl font-semibold text-card-foreground">{dishName}</h2>
          <div className="flex flex-wrap gap-1 self-start">
            {availability === "Online" && deliveryApps.length > 0 ? (
              deliveryApps.map((app) => (
                <span
                  key={app}
                  className="inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-green-100 text-green-800"
                >
                  {app}
                </span>
              ))
            ) : (
              <span
                className={cn(
                  "inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                  availability === "Online" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                )}
              >
                {availability === "Online" ? "Online" : "In-Store"}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {restaurantName} - {city}
        </p>

        <div className="space-y-1 mb-3 flex-grow">
          <div className="text-sm">
            <span className="text-muted-foreground">Price: </span>
            <span>{price}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Protein: </span>
            <span>{getProteinEmojis(protein)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Taste: </span>
            <span>{getTasteEmojis(taste)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Satisfaction: </span>
            <span>{getSatisfactionEmojis(satisfaction)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Added by {addedBy}</p>
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{addedBy.charAt(0)}</span>
          </div>
        </div>
      </div>

      {/* Action Section - Fixed Bottom */}
      <div className="p-4 pt-0 space-y-3 mt-auto">
        {availability === "Online" && deliveryApps.length > 0 ? (
          <div className="space-y-2">
            {deliveryApps.map((app) => (
              <Button 
                key={app}
                onClick={() => handleDeliveryAppClick(app)}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white border-0 text-sm"
                )}
              >
                <Link className="mr-2 h-4 w-4" />
                Open {app}
              </Button>
            ))}
          </div>
        ) : availability === "Online" ? (
          <Button 
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 text-white border-0"
            )}
            disabled
          >
            <Link className="mr-2 h-4 w-4" />
            Online
          </Button>
        ) : (
          <Button 
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
            )}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Navigate
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
        
        {/* Minimal expand button for comments */}
        {comment && comment.trim().length > 0 && (
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{isExpanded ? "Hide" : "Show"} comment</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isExpanded && "rotate-180")} />
          </button>
        )}
      </div>
      
      {/* Expandable Comment Section */}
      {comment && comment.trim().length > 0 && isExpanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <div className="bg-background rounded-lg p-3 shadow-sm">
            <p className="text-sm text-foreground leading-relaxed">
              {comment}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
