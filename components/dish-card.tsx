"use client"

import { useState } from "react"
import { Bookmark, Link, MapPin, ChevronDown } from "lucide-react"
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
  deliveryAppName?: string | null
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
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
  deliveryAppName,
  isBookmarked = false,
  onBookmarkToggle,
}: DishCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked)
    onBookmarkToggle?.(id)
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

  const handleDeliveryAppClick = () => {
    if (!deliveryAppName) return

    const deliveryAppDeepLinks = {
      "Swiggy": {
        mobile: "swiggy://",
        web: "https://www.swiggy.com",
        fallback: "https://www.swiggy.com"
      },
      "Zomato": {
        mobile: "zomato://",
        web: "https://www.zomato.com",
        fallback: "https://www.zomato.com"
      },
      "Uber Eats": {
        mobile: "uber://",
        web: "https://www.ubereats.com",
        fallback: "https://www.ubereats.com"
      },
      "DoorDash": {
        mobile: "doordash://",
        web: "https://www.doordash.com",
        fallback: "https://www.doordash.com"
      }
    }

    const appConfig = deliveryAppDeepLinks[deliveryAppName as keyof typeof deliveryAppDeepLinks]
    if (!appConfig) return

    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Try deep link first, fallback to web
      window.location.href = appConfig.mobile
      setTimeout(() => {
        window.open(appConfig.fallback, '_blank')
      }, 1000)
    } else {
      // Desktop - open web version
      window.open(appConfig.web, '_blank')
    }
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
          <span
            className={cn(
              "inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap self-start",
              availability === "Online" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            )}
          >
            {availability === "Online" ? deliveryAppName || "Online" : availability}
          </span>
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

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{addedBy.charAt(0)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Added by your friend {addedBy}</p>
        </div>
      </div>

      {/* Action Section - Fixed Bottom */}
      <div className="p-4 pt-0 space-y-3 mt-auto">
        {availability === "Online" ? (
          <Button 
            onClick={handleDeliveryAppClick}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 text-white border-0"
            )}
          >
            <Link className="mr-2 h-4 w-4" />
            Open {deliveryAppName || "Delivery App"}
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
