"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { DishCard } from "@/components/dish-card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
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
    city: "Mumbai", // Changed to Mumbai so it shows in filtered results
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
    city: "Mumbai", // Changed to Mumbai so it shows in filtered results
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

type ProteinSource = "All" | "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Other"

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

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [bookmarkedDishes, setBookmarkedDishes] = useState<Set<string>>(new Set())
  const [selectedProteinFilter, setSelectedProteinFilter] = useState<ProteinSource>("All")
  const [priceSort, setPriceSort] = useState("default")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [userName, setUserName] = useState("User")
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
          setUserName(data.name || "User")
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

  const filteredDishes = dishes
    .filter((dish) => {
      const cityMatch = dish.city === userCity
      const proteinMatch = selectedProteinFilter === "All" || dish.protein_source === selectedProteinFilter
      return cityMatch && proteinMatch
    })
    .sort((a, b) => {
      // Extract numeric value from price strings like "₹320"; fallback to Infinity/0
      const parsePrice = (p: string | undefined) => {
        if (!p) return NaN
        const n = Number(String(p).replace(/[^0-9.]/g, ""))
        return isNaN(n) ? NaN : n
      }
      const pa = parsePrice(a.price)
      const pb = parsePrice(b.price)

      if (priceSort === "low-to-high") {
        const va = isNaN(pa) ? Number.POSITIVE_INFINITY : pa
        const vb = isNaN(pb) ? Number.POSITIVE_INFINITY : pb
        return va - vb
      }
      if (priceSort === "high-to-low") {
        const va = isNaN(pa) ? Number.NEGATIVE_INFINITY : pa
        const vb = isNaN(pb) ? Number.NEGATIVE_INFINITY : pb
        return vb - va
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
          <p className="text-lg text-muted-foreground">
            {loadingProfile ? "Loading..." : `Discover high-protein meals in ${userCity}`}
          </p>
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

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dishes...</p>
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
                isBookmarked={bookmarkedDishes.has(dish.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No dishes found in {userCity}.</p>
            <p className="text-muted-foreground">Try adjusting your filters or be the first to add a dish!</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
