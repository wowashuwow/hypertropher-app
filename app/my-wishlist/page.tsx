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
  protein: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  addedBy: string
  availability: "In-Store" | "Online"
  image_url: string
  protein_source: string
  delivery_apps?: string[]
  place_id?: string | null
  users: { name: string; profile_picture_url?: string | null }
}

export default function MyListPage() {
  const [savedDishes, setSavedDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  const { user, userProfile } = useSession()

  // Use SessionProvider data instead of fetching separately
  useEffect(() => {
    if (userProfile) {
      setUserCity(userProfile.city || "Mumbai")
      setLoadingProfile(false)
    }
  }, [userProfile])

  // Fetch wishlist dishes from API
  useEffect(() => {
    const fetchWishlistDishes = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const wishlistDishes = await response.json()
          setSavedDishes(wishlistDishes)
        } else {
          throw new Error('Failed to fetch wishlist')
        }
      } catch (err) {
        console.error('Error fetching wishlist dishes:', err)
        setError('Failed to load wishlist. Please try again later.')
        setSavedDishes([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistDishes()
  }, [user])

  const handleBookmarkToggle = async (dishId: string) => {
    try {
      // Remove from wishlist via API
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dish_id: dishId }),
      })
      
      if (response.ok) {
        // Update local state
        setSavedDishes((prev) => prev.filter((dish) => dish.id !== dishId))
      } else {
        console.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
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
              <p className="text-muted-foreground">Please check your internet connection or try again later.</p>
            </div>
          ) : savedDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDishes.map((dish: any) => (
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
                  addedByProfilePicture={dish.users?.profile_picture_url || null}
                  imageUrl={dish.image_url}
                  // New restaurant-centric props
                  restaurant={dish.restaurant}
                  hasInStore={dish.hasInStore}
                  deliveryApps={dish.deliveryApps || dish.delivery_apps || []}
                  // Legacy props for backward compatibility
                  availability={dish.availability}
                  proteinSource={dish.protein_source}
                  placeId={dish.place_id}
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
