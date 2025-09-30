"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"


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
  delivery_apps?: string[]
  users: { name: string }
}

export default function MyListPage() {
  const [savedDishes, setSavedDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  const { user } = useSession()

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

  // Fetch wishlist dishes from API
  useEffect(() => {
    const fetchWishlistDishes = async () => {
      try {
        setLoading(true)
        // TODO: Implement wishlist API endpoint
        setSavedDishes([])
      } catch (err) {
        console.error('Error fetching wishlist dishes:', err)
        setError('Failed to load wishlist. Please try again later.')
        setSavedDishes([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistDishes()
  }, [])

  const handleBookmarkToggle = (dishId: string) => {
    setSavedDishes((prev) => prev.filter((dish) => dish.id !== dishId))
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-7xl mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold text-foreground mb-8">Your 'Want to Try' List</h1>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg mb-4">{error}</p>
              <p className="text-muted-foreground">Using sample data for now.</p>
            </div>
          ) : savedDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDishes.map((dish) => (
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
                  deliveryApps={dish.delivery_apps}
                  isBookmarked={true} 
                  onBookmarkToggle={handleBookmarkToggle} 
                />
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
    </ProtectedRoute>
  )
}
