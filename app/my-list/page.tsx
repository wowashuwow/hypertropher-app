"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"

// Mock saved dishes data
const mockSavedDishes = [
  {
    id: "1",
    dishName: "Grilled Chicken Bowl",
    restaurantName: "Healthy Bites",
    city: "Mumbai",
    price: "$$" as const,
    protein: "High" as const,
    taste: "Good" as const,
    addedBy: "Rohan K.",
    imageUrl: "/grilled-chicken-vegetable-bowl.png",
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
    imageUrl: "/fish-curry-with-rice-indian-cuisine.jpg",
  },
]

export default function MyListPage() {
  const [savedDishes, setSavedDishes] = useState(mockSavedDishes)

  const handleBookmarkToggle = (dishId: string) => {
    setSavedDishes((prev) => prev.filter((dish) => dish.id !== dishId))
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your 'Want to Try' List</h1>

        {savedDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedDishes.map((dish) => (
              <DishCard key={dish.id} {...dish} isBookmarked={true} onBookmarkToggle={handleBookmarkToggle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">Your saved dishes will appear here.</p>
            <p className="text-muted-foreground">Start exploring and save your first one!</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
