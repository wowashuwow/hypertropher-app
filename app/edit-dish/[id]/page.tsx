"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeliveryAppPills } from "@/components/ui/delivery-app-pills"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeliveryAppsForCity } from "@/lib/hooks/use-delivery-apps"
import { ArrowLeft, Save, X } from "lucide-react"

interface Dish {
  id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: number
  protein_content: "💪 Overloaded" | "👍 Great"
  taste: "🤤 Amazing" | "👍 Great"
  satisfaction: "🤩 Would Eat Everyday" | "👍 Great"
  comment?: string
  availability: "In-Store" | "Online"
  protein_source: string
  delivery_apps?: string[]
  image_url?: string
}

export default function EditDishPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSession()
  const dishId = params.id as string

  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [dishName, setDishName] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [price, setPrice] = useState("")
  const [proteinSource, setProteinSource] = useState("")
  const [protein, setProtein] = useState<"💪 Overloaded" | "👍 Great">("👍 Great")
  const [taste, setTaste] = useState<"🤤 Amazing" | "👍 Great">("👍 Great")
  const [satisfaction, setSatisfaction] = useState<"🤩 Would Eat Everyday" | "👍 Great">("👍 Great")
  const [comment, setComment] = useState("")
  const [availability, setAvailability] = useState<"In-Store" | "Online">("In-Store")
  const [deliveryApps, setDeliveryApps] = useState<string[]>([])
  const [userCity, setUserCity] = useState("")

  // Delivery apps filtering based on user's city
  const { availableApps, country, hasApps } = useDeliveryAppsForCity(userCity || "")

  // Fetch dish data
  useEffect(() => {
    const fetchDish = async () => {
      if (!dishId) return

      try {
        setLoading(true)
        const response = await fetch('/api/dishes')
        if (!response.ok) {
          throw new Error('Failed to fetch dishes')
        }
        const dishes = await response.json()
        const dish = dishes.find((d: any) => d.id === dishId)
        
        if (!dish) {
          throw new Error('Dish not found')
        }

        // Check if user owns this dish
        if (dish.user_id !== user?.id) {
          throw new Error('You can only edit your own dishes')
        }

        setDish(dish)
        setDishName(dish.dish_name)
        setRestaurantName(dish.restaurant_name)
        setPrice(dish.price.toString())
        setProteinSource(dish.protein_source)
        setProtein(dish.protein_content)
        setTaste(dish.taste)
        setSatisfaction(dish.satisfaction)
        setComment(dish.comment || "")
        setAvailability(dish.availability)
        setDeliveryApps(dish.delivery_apps || [])
      } catch (err) {
        console.error('Error fetching dish:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dish')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDish()
    }
  }, [dishId, user])

  // Fetch user's city for delivery app filtering
  useEffect(() => {
    const fetchUserCity = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUserCity(data.city || "")
        }
      } catch (error) {
        console.error('Error fetching user city:', error)
      }
    }

    fetchUserCity()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dish) return

    try {
      setSaving(true)
      setError(null)

      const dishData = {
        id: dish.id,
        dish_name: dishName,
        restaurant_name: restaurantName,
        city: dish.city, // Keep the original city value
        price: parseFloat(price),
        protein_source: proteinSource,
        protein_content: protein,
        taste,
        satisfaction,
        comment: comment.trim() || null,
        availability,
        delivery_apps: availability === "Online" ? deliveryApps : [],
      }

      const response = await fetch('/api/dishes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dishData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update dish')
      }

      // Redirect back to My Dishes page
      router.push('/my-dishes')
    } catch (err) {
      console.error('Error updating dish:', err)
      setError(err instanceof Error ? err.message : 'Failed to update dish')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/my-dishes')
  }

  const ButtonGroup = ({
    options,
    value,
    onChange,
    name,
  }: {
    options: string[]
    value: string
    onChange: (value: string) => void
    name: string
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option)}
          className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap"
        >
          {option}
        </Button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="max-w-2xl mx-auto py-8 px-6">
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-4 text-muted-foreground">Loading dish...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="max-w-2xl mx-auto py-8 px-6">
            <div className="text-center py-16">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <Button onClick={handleCancel} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Dishes
              </Button>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-2xl mx-auto py-8 px-6">
          <div className="mb-6">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Dishes
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Edit Dish</h1>
            <p className="text-muted-foreground mt-2">Update your dish information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dish Information</CardTitle>
              <CardDescription>
                Update the details of your dish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Availability (Source Type) */}
                <div className="space-y-2">
                  <Label>Availability *</Label>
                  <Select value={availability} onValueChange={(value: "In-Store" | "Online") => setAvailability(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-Store">In-Store</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Apps - Only show for Online */}
                {availability === "Online" && (
                  <div className="space-y-2">
                    <Label>Delivery Apps *</Label>
                    <DeliveryAppPills
                      availableApps={hasApps ? availableApps : []}
                      selectedApps={deliveryApps}
                      onSelectionChange={setDeliveryApps}
                      disabled={!hasApps}
                    />
                  </div>
                )}

                {/* Restaurant Name */}
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Enter restaurant name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                  />
                </div>

                {/* Dish Name */}
                <div className="space-y-2">
                  <Label htmlFor="dishName">Dish Name *</Label>
                  <Input
                    id="dishName"
                    type="text"
                    placeholder="Enter dish name"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    required
                  />
                </div>

                {/* Protein Source */}
                <div className="space-y-2">
                  <Label>Protein Source *</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "🐔 Chicken", value: "Chicken" },
                      { label: "🐟 Fish", value: "Fish" },
                      { label: "🧀 Paneer", value: "Paneer" },
                      { label: "🥩 Tofu", value: "Tofu" },
                      { label: "🥚 Eggs", value: "Eggs" },
                      { label: "🐑 Mutton", value: "Mutton" },
                      { label: "🍽️ Other", value: "Other" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={proteinSource === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProteinSource(option.value as typeof proteinSource)}
                        className="flex-1 min-w-fit text-xs sm:text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taste</Label>
                    <ButtonGroup
                      options={["🤤 Amazing", "👍 Great"]}
                      value={taste}
                      onChange={(value) => setTaste(value as typeof taste)}
                      name="taste"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Protein Content</Label>
                    <ButtonGroup
                      options={["💪 Overloaded", "👍 Great"]}
                      value={protein}
                      onChange={(value) => setProtein(value as typeof protein)}
                      name="protein"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Satisfaction</Label>
                    <ButtonGroup
                      options={["🤩 Would Eat Everyday", "👍 Great"]}
                      value={satisfaction}
                      onChange={(value) => setSatisfaction(value as typeof satisfaction)}
                      name="satisfaction"
                    />
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Comments (Optional)</Label>
                  <textarea
                    id="comment"
                    placeholder="e.g., A bit spicy, but great portion size!"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={saving || !dishName || !restaurantName || !price || !proteinSource || (availability === "Online" && deliveryApps.length === 0) || (availability === "Online" && !hasApps)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
