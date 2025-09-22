"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md relative">
      <div className="aspect-[4/5] relative">
        <img src={imageUrl || "/placeholder.svg"} alt={dishName} className="w-full h-full object-cover" />
        <button
          onClick={handleBookmarkClick}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Bookmark className={cn("w-5 h-5", bookmarked ? "fill-primary text-primary" : "text-gray-600")} />
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-card-foreground mb-1">{dishName}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {restaurantName} - {city}
        </p>

        <div className="space-y-1 mb-3">
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

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{addedBy.charAt(0)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Added by your friend {addedBy}</p>
        </div>
      </div>
    </div>
  )
}
