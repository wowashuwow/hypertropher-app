"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"

const mockDishes = [
  {
    id: "1",
    dish_name: "Grilled Chicken Bowl",
    restaurant_name: "Healthy Bites",
    city: "Mumbai",
    price: "₹320",
    protein: "💪 Overloaded" as const,
    taste: "🤤 Amazing" as const,
    satisfaction: "🤩 Would Eat Everyday" as const,
    comment: "The chicken was perfectly grilled and very juicy. Great portion size!",
    addedBy: "Rohan K.",
    availability: "In-Store" as const,
    image_url: "/grilled-chicken-vegetable-bowl.png",
    protein_source: "Chicken" as const,
    users: { name: "Rohan K." },
  },
  {
    id: "2",
    dish_name: "Paneer Tikka Salad",
    restaurant_name: "Green Garden",
    city: "Mumbai",
    price: "₹199",
    protein: "👍 Great" as const,
    taste: "👍 Great" as const,
    satisfaction: "👍 Great" as const,
    addedBy: "Priya S.",
    availability: "Online" as const,
    image_url: "/paneer-tikka-salad-with-fresh-greens.jpg",
    protein_source: "Paneer" as const,
    users: { name: "Priya S." },
  },
  {
    id: "3",
    dish_name: "Fish Curry with Rice",
    restaurant_name: "Coastal Kitchen",
    city: "Mumbai",
    price: "₹420",
    protein: "💪 Overloaded" as const,
    taste: "🤤 Amazing" as const,
    satisfaction: "🤩 Would Eat Everyday" as const,
    comment: "A bit spicy, but the fish was fresh and flavorful. Perfect with rice!",
    addedBy: "Aditya M.",
    availability: "In-Store" as const,
    image_url: "/fish-curry-with-rice-indian-cuisine.jpg",
    protein_source: "Fish" as const,
    users: { name: "Aditya M." },
  },
  {
    id: "4",
    dish_name: "Egg White Omelette",
    restaurant_name: "Morning Fresh",
    city: "Mumbai",
    price: "₹150",
    protein: "👍 Great" as const,
    taste: "👍 Great" as const,
    satisfaction: "👍 Great" as const,
    addedBy: "Sneha R.",
    availability: "Online" as const,
    image_url: "/vegetable-egg-white-omelette.png",
    protein_source: "Eggs" as const,
    users: { name: "Sneha R." },
  },
]

interface Dish {
  id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: string
  protein: "💪 Overloaded" | "👍 Great"
  taste: "🤤 Amazing" | "👍 Great"
  satisfaction: "🤩 Would Eat Everyday" | "👍 Great"
  comment?: string
  addedBy: string
  availability: "In-Store" | "Online"
  image_url: string
  protein_source: string
  users: { name: string }
}

export default function MyDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  const { user } = useSession()
  const currentUser = user?.user_metadata?.name || "User"

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true)
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUserCity(data.city || "Mumbai")
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Fetch dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dishes')
        if (!response.ok) {
          throw new Error('Failed to fetch dishes')
        }
        const data = await response.json()
        
        // Transform API data to match component interface
        const transformedDishes = data.map((dish: any) => ({
          id: dish.id,
          dish_name: dish.dish_name,
          restaurant_name: dish.restaurant_name,
          city: dish.city,
          price: `₹${dish.price}`,
          protein: dish.protein_content as "💪 Overloaded" | "👍 Great",
          taste: dish.taste as "🤤 Amazing" | "👍 Great",
          satisfaction: dish.satisfaction as "🤩 Would Eat Everyday" | "👍 Great",
          comment: dish.comment,
          addedBy: dish.users?.name || "Unknown",
          availability: dish.availability as "In-Store" | "Online",
          image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
          protein_source: dish.protein_source,
          users: dish.users
        }))
        
        setDishes(transformedDishes)
      } catch (err) {
        console.error('Error fetching dishes:', err)
        setError('Failed to load dishes')
        // Fallback to mock data
        setDishes(mockDishes)
      } finally {
        setLoading(false)
      }
    }

    fetchDishes()
  }, [])

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

  const filteredDishes = dishes.filter((dish) => {
    const cityMatch = dish.city === userCity
    const userMatch = dish.addedBy === currentUser
    return cityMatch && userMatch
  })

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-7xl mx-auto py-8 px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Contributed Dishes</h1>
            <p className="text-lg text-muted-foreground">Your finds in {userCity}</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dishes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg mb-4">{error}</p>
              <p className="text-muted-foreground">Using sample data for now.</p>
            </div>
          ) : filteredDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  id={dish.id}
                  dishName={dish.dish_name}
                  restaurantName={dish.restaurant_name}
                  city={dish.city}
                  price={dish.price}
                  protein={dish.protein}
                  taste={dish.taste}
                  satisfaction={dish.satisfaction}
                  comment={dish.comment}
                  addedBy={dish.addedBy}
                  availability={dish.availability}
                  imageUrl={dish.image_url}
                  proteinSource={dish.protein_source}
                  deliveryAppName={dish.delivery_app_name}
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
    </ProtectedRoute>
  )
}
