"use client"

import { useState, useEffect } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RestaurantInput } from "@/components/ui/restaurant-input"
import { RestaurantInput as RestaurantInputType } from "@/types/restaurant"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { useDeliveryAppsForCity } from "@/lib/hooks/use-delivery-apps"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { compressImageWithTimeout, formatFileSize, getCompressionRatio } from "@/lib/image-compression"
import { useDishesCache } from "@/lib/cache/dishes-cache-provider"

const stripTrailingEmoji = (value: string) => {
  if (!value) return ""
  const trimmed = value.trimEnd()
  const lastSpaceIndex = trimmed.lastIndexOf(" ")
  if (lastSpaceIndex === -1) {
    return trimmed.trim()
  }
  return trimmed.slice(0, lastSpaceIndex).trim()
}

export default function AddDishPage() {
  const router = useRouter()
  const { invalidateCache: invalidateDishesCache } = useDishesCache()
  
  // Form state
  const [restaurant, setRestaurant] = useState<RestaurantInputType | null>(null)
  const [dishName, setDishName] = useState("")
  const [proteinSource, setProteinSource] = useState<"Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Beef" | "Other" | "">("")
  const [price, setPrice] = useState<string>("")
  const [taste, setTaste] = useState<"Exceptional" | "Assured" | "">("")
  const [protein, setProtein] = useState<"Overloaded" | "Assured" | "">("")
  const [satisfaction, setSatisfaction] = useState<"Daily Fuel" | "Assured" | "">("")
  const [comment, setComment] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [compressedPhoto, setCompressedPhoto] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionComplete, setCompressionComplete] = useState(false)
  const [userCity, setUserCity] = useState("Mumbai")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle')
  const [uploadFileSize, setUploadFileSize] = useState<string>('')

  // Geolocation hooks
  const {
    userLocation,
    locationPermissionGranted,
    locationPermissionRequested,
    locationError,
    locationErrorType,
    locationErrorBrowser,
    loading: locationLoading,
    requestLocationPermission,
    checkGeolocationSupport,
  } = useGeolocation()

  // Delivery apps filtering based on user's city
  const { availableApps, country, hasApps } = useDeliveryAppsForCity(userCity || "")

  // Fetch user's profile data to get their selected city
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUserCity(data.city || "Mumbai")
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  // Automatic availability logic
  const isGoogleMapsRestaurant = restaurant?.type === 'google_maps'
  const isCloudKitchen = restaurant?.type === 'manual'
  const hasInStore = isGoogleMapsRestaurant // Google Maps restaurants automatically have In-Store
  const hasOnlineAvailability = availableApps.length > 0 && hasApps // Auto-apply all available apps for online availability

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setIsCompressing(true)
      setCompressionComplete(false)
      
      try {
        // Start compression in background
        const compressed = await compressImageWithTimeout(file)
        setCompressedPhoto(compressed)
        setCompressionComplete(true)
        
        // Log compression results for debugging
        const originalSize = formatFileSize(file.size)
        const compressedSize = formatFileSize(compressed.size)
        const ratio = getCompressionRatio(file.size, compressed.size)
        console.log(`Image compressed: ${originalSize} → ${compressedSize} (${ratio.toFixed(1)}% reduction)`)
      } catch (error) {
        console.warn('Compression failed, will use original file:', error)
        setCompressedPhoto(null)
        setCompressionComplete(true)
      } finally {
        setIsCompressing(false)
      }
    }
  }

  // Helper functions for API calls
  const createOrFindRestaurant = async (restaurantInput: RestaurantInputType, city: string) => {
    console.log("🏪 Frontend: Creating/finding restaurant with:", {
      type: restaurantInput.type,
      googleMapsData: restaurantInput.googleMapsData,
      manualData: restaurantInput.manualData,
      city
    })

    const response = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: restaurantInput.type,
        googleMapsData: restaurantInput.googleMapsData,
        manualData: restaurantInput.manualData,
        city
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ Frontend: Restaurant API failed:", errorData)
      throw new Error('Failed to create/find restaurant')
    }

    const { restaurant } = await response.json()
    console.log("✅ Frontend: Restaurant created/found:", restaurant)
    return restaurant.id
  }

  const uploadPhoto = async (photo: File) => {
    const supabase = createClient()
    
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('You must be logged in to upload photos')
    }
    
    // Add randomness to prevent collisions if multiple users upload at same millisecond
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${photo.name}`
    // Use user ID prefix for security: {user_id}/{filename}
    const filePath = `${user.id}/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
      .from("dish-photos")
      .upload(filePath, photo)

      if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`)
    }

      const { data: urlData } = supabase.storage
        .from("dish-photos")
      .getPublicUrl(uploadData.path)
    
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!restaurant) {
      alert("Please select or add a restaurant.")
      return
    }
    if (!dishName.trim()) {
      alert("Dish name is required.")
      return
    }
    if (!proteinSource) {
      alert("Protein source is required.")
      return
    }
    if (!hasInStore && !hasOnlineAvailability) {
      alert("Please select at least one availability option (In-Store or delivery apps).")
      return
    }
    if (!price) {
      alert("Price is required.")
      return
    }
    
    // Check if compression is still running
    if (isCompressing) {
      alert("Please wait, image is still being processed...")
      return
    }
    
    setIsLoading(true)

    try {
      // 1. Create or find restaurant
      const restaurantId = await createOrFindRestaurant(restaurant, userCity)

      // 2. Upload photo if provided (use compressed version if available)
      let imageUrl = ""
      if (photo) {
        setUploadStatus('uploading')
        const fileToUpload = compressedPhoto || photo // Use compressed version if available
        const fileSizeMB = fileToUpload.size / (1024 * 1024)
        setUploadFileSize(fileSizeMB < 1 ? `${Math.round(fileSizeMB * 1024)}KB` : `${fileSizeMB.toFixed(1)}MB`)
        
        imageUrl = await uploadPhoto(fileToUpload)
        setUploadStatus('completed')
      }

      // 3. Create dish
    const dishData = {
        restaurant_id: restaurantId,
        dish_name: dishName.trim(),
      price: parseFloat(price),
      protein_source: proteinSource,
        taste: taste || null,
        protein_content: protein || null,
        satisfaction: satisfaction || null,
        comment: comment.trim() || null,
        image_url: imageUrl || null,
      }

      const dishResponse = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData),
      })

      if (!dishResponse.ok) {
        throw new Error('Failed to create dish')
      }

      const { dishId } = await dishResponse.json()

      // 4. Create availability channels
      if (hasInStore) {
        await fetch('/api/dishes/availability-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dish_id: dishId,
            channel: 'In-Store',
          }),
        })
      }

      if (hasOnlineAvailability) {
        const channelResponse = await fetch('/api/dishes/availability-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dish_id: dishId,
            channel: 'Online',
          }),
        })

        const { availabilityChannel } = await channelResponse.json()
        const availabilityChannelId = availabilityChannel.id

        // 5. Add delivery apps (auto-apply all available apps for the region)
        for (const app of availableApps) {
          const deliveryAppResponse = await fetch('/api/dishes/delivery-apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dish_id: dishId,
              availability_channel_id: availabilityChannelId,
              delivery_app: app,
            }),
          })
          
          if (!deliveryAppResponse.ok) {
            console.error(`Failed to add delivery app ${app}:`, await deliveryAppResponse.text())
            throw new Error(`Failed to add delivery app ${app}`)
          }
        }
      }

      // Invalidate dishes cache so discover page shows new dish
      invalidateDishesCache()
      alert("Dish submitted successfully!")
      router.push('/')
    } catch (error) {
      console.error("Submission Error:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
    }
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

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add a Dish You Found</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Selection */}
              <RestaurantInput
                  value={restaurant}
                onChange={setRestaurant}
                  userCity={userCity}
                  userLocation={userLocation}
                locationPermissionGranted={locationPermissionGranted}
                locationPermissionRequested={locationPermissionRequested}
                locationError={locationError}
                locationErrorType={locationErrorType}
                locationErrorBrowser={locationErrorBrowser}
                onRequestLocationPermission={requestLocationPermission}
              />

              <div className="space-y-2">
                <Label htmlFor="dishName">Dish Name</Label>
                <Input
                  id="dishName"
                  type="text"
                  placeholder="Enter dish name"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Protein Source *</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🐔 Chicken", value: "Chicken" },
                    { label: "🐟 Fish", value: "Fish" },
                    { label: "🧀 Paneer", value: "Paneer" },
                    { label: "🌱 Tofu", value: "Tofu" },
                    { label: "🥚 Eggs", value: "Eggs" },
                    { label: "🐑 Mutton/Lamb", value: "Mutton" },
                    { label: "🥩 Beef", value: "Beef" },
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

              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <label htmlFor="photo" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{photo ? photo.name : "Click to upload photo"}</p>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Taste</Label>
                  <ButtonGroup
                    options={["Assured 👍", "Exceptional 🔥"]}
                    value={
                      taste === "Assured"
                        ? "Assured 👍"
                        : taste === "Exceptional"
                          ? "Exceptional 🔥"
                          : ""
                    }
                    onChange={(value) => {
                      const cleaned = stripTrailingEmoji(value)
                      setTaste(cleaned as typeof taste)
                    }}
                    name="taste"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Protein Content</Label>
                  <ButtonGroup
                    options={["Assured 👍", "Overloaded 🔥"]}
                    value={
                      protein === "Assured"
                        ? "Assured 👍"
                        : protein === "Overloaded"
                          ? "Overloaded 🔥"
                          : ""
                    }
                    onChange={(value) => {
                      const cleaned = stripTrailingEmoji(value)
                      setProtein(cleaned as typeof protein)
                    }}
                    name="protein"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
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
                    options={["Assured 👍", "Daily Fuel 🔥"]}
                    value={
                      satisfaction === "Assured"
                        ? "Assured 👍"
                        : satisfaction === "Daily Fuel"
                          ? "Daily Fuel 🔥"
                          : ""
                    }
                    onChange={(value) => {
                      const cleaned = stripTrailingEmoji(value)
                      setSatisfaction(cleaned as typeof satisfaction)
                    }}
                    name="satisfaction"
                  />
                </div>

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
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isLoading || !restaurant || !dishName || !proteinSource || (!hasInStore && !hasOnlineAvailability) || !price}
              >
                {isLoading ? (
                  uploadStatus === 'uploading' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading {uploadFileSize}...</span>
                    </div>
                  ) : uploadStatus === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating dish...</span>
                    </div>
                  ) : (
                    "Submitting..."
                  )
                ) : (
                  "Submit Dish"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
