"use client"

import { useState } from "react"
import { Bookmark, Link, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DishCardProps {
  id: string
  dishName: string
  restaurantName: string
  city: string
  imageUrl?: string
  price: "$" | "$$" | "$$$"
  protein: "High" | "Moderate"
  taste: "Good" | "Okay"
  satisfaction?: "High" | "Medium" | "Low"
  addedBy: string
  availability: "Online" | "In-Store"
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
  satisfaction = "High",
  addedBy,
  availability,
  isBookmarked = false,
  onBookmarkToggle,
}: DishCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked)
    onBookmarkToggle?.(id)
  }

  const getPriceEmojis = (price: string) => {
    const emojiMap = { $: "💲", $$: "💲💲", $$$: "💲💲💲" }
    return emojiMap[price as keyof typeof emojiMap] || "💲"
  }

  const getProteinEmojis = (protein: string) => {
    return protein === "High" ? "💪💪💪" : "💪💪"
  }

  const getTasteEmojis = (taste: string) => {
    return taste === "Good" ? "🤌🤌" : "🤌"
  }

  const getSatisfactionEmojis = (satisfaction: string) => {
    const emojiMap = { High: "🤩🤩", Medium: "🤩", Low: "😐" }
    return emojiMap[satisfaction as keyof typeof emojiMap] || "🤩"
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md relative flex flex-col h-full">
      <div className="aspect-[4/5] relative">
        <img src={imageUrl || "/placeholder.svg"} alt={dishName} className="w-full h-full object-cover" />
        <button
          onClick={handleBookmarkClick}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Bookmark className={cn("w-5 h-5", bookmarked ? "fill-primary text-primary" : "text-gray-600")} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h2 className="text-xl font-semibold text-card-foreground">{dishName}</h2>
          <span
            className={cn(
              "inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap self-start",
              availability === "Online" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            )}
          >
            {availability}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {restaurantName} - {city}
        </p>

        <div className="space-y-1 mb-3 flex-grow">
          <div className="text-sm">
            <span className="text-muted-foreground">Cost: </span>
            <span>{getPriceEmojis(price)}</span>
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

        <div className="mt-auto">
          {availability === "Online" ? (
            <Button 
              className={cn(
                "w-full bg-green-600 hover:bg-green-700 text-white border-0"
              )}
            >
              <Link className="mr-2 h-4 w-4" />
              View on Delivery App
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
        </div>
      </div>
    </div>
  )
}
