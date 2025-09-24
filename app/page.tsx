"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

const mockDishes = [
  {
    id: "1",
    dishName: "Grilled Chicken Bowl",
    restaurantName: "Healthy Bites",
    city: "Mumbai",
    price: "$$" as const,
    protein: "High" as const,
    taste: "Good" as const,
    addedBy: "Rohan K.",
    availability: "In-Store" as const,
    imageUrl: "/grilled-chicken-vegetable-bowl.png",
    proteinSource: "Chicken" as const,
  },
  {
    id: "2",
    dishName: "Paneer Tikka Salad",
    restaurantName: "Green Garden",
    city: "Mumbai", // Changed to Mumbai so it shows in filtered results
    price: "$" as const,
    protein: "High" as const,
    taste: "Good" as const,
    addedBy: "Priya S.",
    availability: "Online" as const,
    imageUrl: "/paneer-tikka-salad-with-fresh-greens.jpg",
    proteinSource: "Paneer" as const,
  },
  {
    id: "3",
    dishName: "Fish Curry with Rice",
    restaurantName: "Coastal Kitchen",
    city: "Mumbai",
    price: "$$$" as const,
    protein: "High" as const,
    taste: "Good" as const,
    addedBy: "Aditya M.",
    availability: "In-Store" as const,
    imageUrl: "/fish-curry-with-rice-indian-cuisine.jpg",
    proteinSource: "Fish" as const,
  },
  {
    id: "4",
    dishName: "Egg White Omelette",
    restaurantName: "Morning Fresh",
    city: "Mumbai", // Changed to Mumbai so it shows in filtered results
    price: "$" as const,
    protein: "Moderate" as const,
    taste: "Okay" as const,
    addedBy: "Sneha R.",
    availability: "Online" as const,
    imageUrl: "/vegetable-egg-white-omelette.png",
    proteinSource: "Eggs" as const,
  },
]

type ProteinSource = "All" | "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Other"

export default function HomePage() {
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())
  const [selectedProteinFilter, setSelectedProteinFilter] = useState<ProteinSource>("All")
  const [priceSort, setPriceSort] = useState("default")

  const userName = "Alex"
  const userCity = "Mumbai"

  const handleBookmarkToggle = (dishId: string) => {
    setBookmarkedDishes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dishId)) {
        newSet.delete(dishId)
      } else {
        newSet.add(dishId)
      }
      return newSet
    })
  }

  const filteredDishes = mockDishes
    .filter((dish) => {
      const cityMatch = dish.city === userCity
      const proteinMatch = selectedProteinFilter === "All" || dish.proteinSource === selectedProteinFilter
      return cityMatch && proteinMatch
    })
    .sort((a, b) => {
      const priceRank: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3 }
      if (priceSort === "low-to-high") {
        return (priceRank[a.price] ?? 0) - (priceRank[b.price] ?? 0)
      }
      if (priceSort === "high-to-low") {
        return (priceRank[b.price] ?? 0) - (priceRank[a.price] ?? 0)
      }
      return 0
    })

  const proteinCategories: { label: string; value: ProteinSource }[] = [
    { label: "All", value: "All" },
    { label: "🐔 Chicken", value: "Chicken" },
    { label: "🐟 Fish", value: "Fish" },
    { label: "🧀 Paneer", value: "Paneer" },
    { label: "🥩 Tofu", value: "Tofu" },
    { label: "🥚 Eggs", value: "Eggs" },
    { label: "🐑 Mutton", value: "Mutton" },
    { label: "🍽️ Other", value: "Other" },
  ]

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hey {userName}! 👋</h1>
          <p className="text-lg text-muted-foreground">Discover high-protein meals in {userCity}</p>
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
          <div className="w-56">
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                <SelectItem value="high-to-low">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-56">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Sort by Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest" disabled>
                  Nearest First
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              {...dish}
              isBookmarked={bookmarkedDishes.has(dish.id)}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
