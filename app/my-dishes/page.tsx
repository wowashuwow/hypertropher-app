"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"


interface Dish {
  id: string
  user_id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: string
  protein: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  addedBy: string
  addedByProfilePicture?: string | null
  image_url: string
  protein_source: string
  users: { name: string; profile_picture_url?: string | null }
  // New restaurant-centric fields
  restaurant?: {
    id: string
    name: string
    city: string
    source_type: 'google_maps' | 'manual'
    place_id?: string
    google_maps_address?: string
    latitude?: number
    longitude?: number
    manual_address?: string
    is_cloud_kitchen: boolean
    verified: boolean
  }
  hasInStore?: boolean
  deliveryApps?: string[]
  // Legacy fields for backward compatibility
  availability?: "In-Store" | "Online" | "Both"
  delivery_apps?: string[]
  place_id?: string | null
}

export default function MyDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  const { user, userProfile } = useSession()
  const currentUserId = user?.id
  const router = useRouter()

  // Use SessionProvider data instead of fetching separately
  useEffect(() => {
    if (userProfile) {
      setUserCity(userProfile.city || "Mumbai")
      setLoadingProfile(false)
    }
  }, [userProfile])

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
          user_id: dish.user_id,
          dish_name: dish.dish_name,
          restaurant_name: dish.restaurant_name,
          city: dish.city,
          price: `₹${dish.price}`,
          protein: dish.protein_content,
          taste: dish.taste,
          satisfaction: dish.satisfaction,
          comment: dish.comment,
          addedBy: dish.users?.name || "Unknown",
          addedByProfilePicture: dish.users?.profile_picture_url || null,
          image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
          // New restaurant-centric fields
          restaurant: dish.restaurant,
          hasInStore: dish.hasInStore,
          deliveryApps: dish.deliveryApps || dish.delivery_apps || [],
          // Legacy fields for backward compatibility
          availability: dish.availability as "In-Store" | "Online",
          protein_source: dish.protein_source,
          place_id: dish.place_id,
          users: dish.users
        }))
        
        setDishes(transformedDishes)
      } catch (err) {
        console.error('Error fetching dishes:', err)
        setError('Failed to load dishes. Please try again later.')
        setDishes([])
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

  const handleEdit = (dishId: string) => {
    router.push(`/edit-dish/${dishId}`)
  }

  const handleDelete = async (dishId: string) => {
    if (!confirm('Are you sure you want to delete this dish? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/dishes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: dishId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete dish')
      }

      // Remove the dish from local state
      setDishes((prev) => prev.filter((dish) => dish.id !== dishId))
    } catch (error) {
      console.error('Error deleting dish:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete dish')
    }
  }

  const filteredDishes = dishes.filter((dish) => {
    const cityMatch = dish.city === userCity
    const userMatch = dish.user_id === currentUserId
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
                  addedByProfilePicture={dish.addedByProfilePicture}
                  imageUrl={dish.image_url}
                  // New restaurant-centric props
                  restaurant={dish.restaurant}
                  hasInStore={dish.hasInStore}
                  deliveryApps={dish.deliveryApps}
                  // Legacy props for backward compatibility
                  availability={dish.availability}
                  proteinSource={dish.protein_source}
                  placeId={dish.place_id}
                  isBookmarked={bookmarkedDishes.has(dish.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
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
