"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"

const mockDishes = [
  {
    id: "1",
    dishName: "Grilled Chicken Bowl",
    restaurantName: "Healthy Bites",
    city: "Mumbai",
    price: "₹320",
    protein: "Overloaded" as const,
    taste: "Amazing" as const,
    comment: "The chicken was perfectly grilled and very juicy. Great portion size!",
    addedBy: "Rohan K.",
    availability: "In-Store" as const,
    imageUrl: "/grilled-chicken-vegetable-bowl.png",
    proteinSource: "Chicken" as const,
  },
  {
    id: "2",
    dishName: "Paneer Tikka Salad",
    restaurantName: "Green Garden",
    city: "Mumbai",
    price: "₹199",
    protein: "Great" as const,
    taste: "Great" as const,
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
    price: "₹420",
    protein: "Overloaded" as const,
    taste: "Amazing" as const,
    comment: "A bit spicy, but the fish was fresh and flavorful. Perfect with rice!",
    addedBy: "Aditya M.",
    availability: "In-Store" as const,
    imageUrl: "/fish-curry-with-rice-indian-cuisine.jpg",
    proteinSource: "Fish" as const,
  },
  {
    id: "4",
    dishName: "Egg White Omelette",
    restaurantName: "Morning Fresh",
    city: "Mumbai",
    price: "₹150",
    protein: "Great" as const,
    taste: "Great" as const,
    addedBy: "Sneha R.",
    availability: "Online" as const,
    imageUrl: "/vegetable-egg-white-omelette.png",
    proteinSource: "Eggs" as const,
  },
]

export default function MyDishesPage() {
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())

  const currentUser = "Rohan K."
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

  const filteredDishes = mockDishes.filter((dish) => {
    const cityMatch = dish.city === userCity
    const userMatch = dish.addedBy === currentUser
    return cityMatch && userMatch
  })

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Contributed Dishes</h1>
          <p className="text-lg text-muted-foreground">Your finds in {userCity}</p>
        </div>

        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                {...dish}
                isBookmarked={bookmarkedDishes.has(dish.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">You haven't contributed any dishes yet.</p>
            <p className="text-muted-foreground">Start sharing your favorite high-protein meals!</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
