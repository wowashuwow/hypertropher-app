"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { useSession } from "@/lib/auth/session-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeliveryAppPills } from "@/components/ui/delivery-app-pills"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RestaurantInput } from "@/components/ui/restaurant-input"
import { RestaurantInput as RestaurantInputType } from "@/types/restaurant"
import { useDeliveryAppsForCity } from "@/lib/hooks/use-delivery-apps"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { ArrowLeft, Save, X, AlertCircle, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { compressImageWithTimeout, formatFileSize, getCompressionRatio } from "@/lib/image-compression"

interface Dish {
  id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: number
  protein_content: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  availability: "In-Store" | "Online" | "Both"
  protein_source: string
  delivery_apps?: string[]
  image_url?: string
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
  const [restaurant, setRestaurant] = useState<RestaurantInputType | null>(null)
  const [dishName, setDishName] = useState("")
  const [proteinSource, setProteinSource] = useState("")
  // Automatic availability logic - no need for hasInStore state
  const [deliveryApps, setDeliveryApps] = useState<string[]>([])
  
  // Photo state
  const [photo, setPhoto] = useState<File | null>(null)
  const [compressedPhoto, setCompressedPhoto] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionComplete, setCompressionComplete] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed'>('idle')
  const [uploadFileSize, setUploadFileSize] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  
  // Automatic availability logic
  const isGoogleMapsRestaurant = restaurant?.type === 'google_maps'
  const isCloudKitchen = restaurant?.type === 'manual'
  const hasInStore = isGoogleMapsRestaurant // Google Maps restaurants automatically have In-Store
  const hasOnlineAvailability = deliveryApps.length > 0 // Delivery apps automatically mean Online
  const [price, setPrice] = useState("")
  const [protein, setProtein] = useState<"Overloaded" | "Pretty Good">("Pretty Good")
  const [taste, setTaste] = useState<"Mouthgasm" | "Pretty Good">("Pretty Good")
  const [satisfaction, setSatisfaction] = useState<"Would Eat Everyday" | "Pretty Good">("Pretty Good")
  const [comment, setComment] = useState("")
  const [userCity, setUserCity] = useState("")

  // Geolocation hook
  const {
    userLocation,
    locationPermissionGranted,
    locationPermissionRequested,
    locationError,
    loading: locationLoading,
    requestLocationPermission,
    checkGeolocationSupport,
  } = useGeolocation()

  // Delivery apps filtering based on user's city
  const { availableApps, country, hasApps } = useDeliveryAppsForCity(userCity || "")

  // Restaurant selection is now handled by RestaurantInput component

  // Validation logic - isCloudKitchen already defined above

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
        
        // Load restaurant data
        if (dish.restaurant) {
          // New restaurant-centric data
          if (dish.restaurant.source_type === 'google_maps') {
            setRestaurant({
              type: 'google_maps',
              googleMapsData: {
                place_id: dish.restaurant.place_id,
                name: dish.restaurant.name,
                formatted_address: dish.restaurant.google_maps_address,
                geometry: {
                  location: {
                    lat: dish.restaurant.latitude,
                    lng: dish.restaurant.longitude
                  }
                }
              }
            })
          } else {
            setRestaurant({
              type: 'manual',
              manualData: {
                name: dish.restaurant.name,
                address: dish.restaurant.manual_address,
                isCloudKitchen: dish.restaurant.is_cloud_kitchen
              }
            })
          }
        } else {
          // Fallback for legacy data
          setRestaurant({
            type: 'manual',
            manualData: {
              name: dish.restaurant_name,
              isCloudKitchen: dish.availability === 'Online'
            }
          })
        }
        
        setPrice(dish.price.toString())
        setProteinSource(dish.protein_source)
        setProtein(dish.protein_content)
        setTaste(dish.taste)
        setSatisfaction(dish.satisfaction)
        setComment(dish.comment || "")
        
        // Load existing image
        setImageUrl(dish.image_url || "")
        setPhotoPreview(dish.image_url || "")
        
        // Set availability based on new structure
        // hasInStore is now automatically determined by restaurant type
        setDeliveryApps(dish.deliveryApps || dish.delivery_apps || [])
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

  // Photo upload function
  const uploadPhoto = async (file: File): Promise<string> => {
    const supabase = createClient()
    
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('You must be logged in to upload photos')
    }
    
    // Generate unique filename (match add-dish format with randomness)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.name}`
    // Use user ID prefix for security: {user_id}/{filename}
    const filePath = `${user.id}/${fileName}`

    // Upload to Supabase Storage with user ID folder structure
    const { error: uploadError } = await supabase.storage
      .from('dish-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload photo')
    }

    // Get public URL (use filePath with user ID folder)
    const { data: urlData } = supabase.storage
      .from('dish-photos')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB')
        return
      }

      setPhoto(file)
      setIsCompressing(true)
      setCompressionComplete(false)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
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

  // Helper function to extract file path from Supabase URL
  const extractFilePathFromUrl = (url: string): string | null => {
    if (!url) return null
    
    // Supabase URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{filepath}
    // New format: {user_id}/{filename} or legacy format: {filename} or {dish-images}/{filename}
    const match = url.match(/\/storage\/v1\/object\/public\/dish-photos\/(.+)$/)
    if (match && match[1]) {
      return match[1] // Returns full path: "user-id/filename.jpg" or "old-filename.jpg" (legacy)
    }
    
    return null
  }

  // Delete old photo from storage
  const deleteOldPhoto = async (oldImageUrl: string): Promise<void> => {
    if (!oldImageUrl) return
    
    const supabase = createClient()
    const filePath = extractFilePathFromUrl(oldImageUrl)
    
    if (!filePath) {
      console.warn('⚠️ Could not extract file path from URL:', oldImageUrl)
      return
    }
    
    console.log('🗑️ Deleting old photo:', filePath)
    
    // Get current user to verify ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('👤 Current user ID:', user.id)
      console.log('📂 File path parts:', filePath.split('/'))
    }
    
    const { data, error } = await supabase.storage
      .from('dish-photos')
      .remove([filePath])
    
    if (error) {
      console.error('❌ Failed to delete old photo:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      // Don't throw error - we still want the update to succeed even if deletion fails
    } else {
      console.log('✅ Old photo deleted successfully')
      console.log('✅ Delete response data:', data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dish) return

    try {
      setSaving(true)
      setError(null)

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
      if (!hasInStore && deliveryApps.length === 0) {
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

      // Validate rating values
      const validRatings = ["Pretty Good", "Overloaded", "Mouthgasm", "Would Eat Everyday"];
      const cleanTaste = taste.replace(/^[^\w\s]*\s*/, '');
      const cleanProtein = protein.replace(/^[^\w\s]*\s*/, '');
      const cleanSatisfaction = satisfaction.replace(/^[^\w\s]*\s*/, '');

      if (!validRatings.includes(cleanTaste) || !validRatings.includes(cleanProtein) || !validRatings.includes(cleanSatisfaction)) {
        alert("Invalid rating values. Please select valid ratings.");
        return;
      }

      console.log('🏗️ EditDish: Validation passed, preparing dish data...');
      console.log('🏗️ EditDish: Clean ratings:', { cleanTaste, cleanProtein, cleanSatisfaction });

      // Helper function to create or find restaurant
      const createOrFindRestaurant = async (restaurantInput: RestaurantInputType, city: string) => {
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
          throw new Error('Failed to create/find restaurant')
        }

        const { restaurant: restaurantData } = await response.json()
        return restaurantData.id
      }

      // 1. Create or find restaurant
      const restaurantId = await createOrFindRestaurant(restaurant, dish.city)

      // 2. Upload new photo if provided (use compressed version if available)
      let finalImageUrl = imageUrl // Start with existing image
      if (photo) {
        setUploadStatus('uploading')
        const fileToUpload = compressedPhoto || photo // Use compressed version if available
        const fileSizeMB = fileToUpload.size / (1024 * 1024)
        setUploadFileSize(fileSizeMB < 1 ? `${Math.round(fileSizeMB * 1024)}KB` : `${fileSizeMB.toFixed(1)}MB`)
        
        // Delete old photo before uploading new one
        if (imageUrl) {
          await deleteOldPhoto(imageUrl)
        }
        
        // Upload new photo
        finalImageUrl = await uploadPhoto(fileToUpload)
        setImageUrl(finalImageUrl)
        setUploadStatus('completed')
      }

      // 3. Update dish with new restaurant-centric data
      const dishData = {
        id: dish.id,
        restaurant_id: restaurantId,
        dish_name: dishName.trim(),
        price: parseFloat(price),
        protein_source: proteinSource,
        protein_content: cleanProtein,
        taste: cleanTaste,
        satisfaction: cleanSatisfaction,
        comment: comment.trim() || null,
        image_url: finalImageUrl || null,
      }

      console.log('🏗️ EditDish: Submitting dish data:', dishData)

      // 4. Update dish
      const dishResponse = await fetch('/api/dishes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData),
      })

      if (!dishResponse.ok) {
        throw new Error('Failed to update dish')
      }

      // 4. Update availability channels
      // First, get existing availability channels
      const existingChannelsResponse = await fetch(`/api/dishes/availability-channels?dish_id=${dish.id}`)
      const existingChannels = existingChannelsResponse.ok ? await existingChannelsResponse.json() : []

      // Remove existing channels
      for (const channel of existingChannels) {
        await fetch(`/api/dishes/availability-channels?id=${channel.id}`, {
          method: 'DELETE',
        })
      }

      // Add new availability channels
      if (hasInStore) {
        await fetch('/api/dishes/availability-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dish_id: dish.id,
            channel: 'In-Store',
          }),
        })
      }

      if (deliveryApps.length > 0) {
        const channelResponse = await fetch('/api/dishes/availability-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dish_id: dish.id,
            channel: 'Online',
          }),
        })

        const { availabilityChannel } = await channelResponse.json()
        const availabilityChannelId = availabilityChannel.id

        // Add delivery apps
        for (const app of deliveryApps) {
          const deliveryAppResponse = await fetch('/api/dishes/delivery-apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dish_id: dish.id,
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

      alert("Dish updated successfully!")
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
                {/* Restaurant Selection */}
                <RestaurantInput
                  value={restaurant}
                  onChange={setRestaurant}
                  userCity={userCity}
                  userLocation={userLocation}
                  locationPermissionGranted={locationPermissionGranted}
                  locationPermissionRequested={locationPermissionRequested}
                  locationError={locationError}
                  onRequestLocationPermission={requestLocationPermission}
                />

                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Dish Photo {photo && "(New)"}</Label>
                  <div className="flex flex-col gap-4">
                    {/* Current/Preview Image */}
                    {photoPreview && (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-border">
                        <img 
                          src={photoPreview} 
                          alt="Dish preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="photo"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo')?.click()}
                        className="w-full"
                        disabled={uploadStatus === 'uploading'}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photo ? 'Change Photo' : photoPreview ? 'Update Photo' : 'Add Photo'}
                      </Button>
                    </div>
                    
                    {/* Upload Status */}
                    {uploadStatus === 'uploading' && (
                      <div className="text-sm text-muted-foreground">
                        Uploading photo ({uploadFileSize})...
                      </div>
                    )}
                    {uploadStatus === 'completed' && (
                      <div className="text-sm text-green-600">
                        Photo uploaded successfully!
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: High-quality photo (JPEG, PNG, or WebP, max 5MB)
                  </p>
                </div>

                {/* Delivery Apps Selection - Always visible */}
                <div className="space-y-2">
                  <Label>Delivery Apps (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Select delivery apps if this dish is available online
                  </p>
                  <DeliveryAppPills
                    availableApps={hasApps ? availableApps : []}
                    selectedApps={deliveryApps}
                    onSelectionChange={setDeliveryApps}
                    disabled={!hasApps}
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

                {/* Ratings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taste</Label>
                    <ButtonGroup
                      options={["🤤🤤🤤 Mouthgasm", "👍 Pretty Good"]}
                      value={taste === "Mouthgasm" ? "🤤🤤🤤 Mouthgasm" : "👍 Pretty Good"}
                      onChange={(value) => setTaste(value.replace(/^[^\w\s]*\s*/, '') as typeof taste)}
                      name="taste"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Protein Content</Label>
                    <ButtonGroup
                      options={["💪💪💪 Overloaded", "👍 Pretty Good"]}
                      value={protein === "Overloaded" ? "💪💪💪 Overloaded" : "👍 Pretty Good"}
                      onChange={(value) => setProtein(value.replace(/^[^\w\s]*\s*/, '') as typeof protein)}
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
                      options={["🤩🤩🤩 Would Eat Everyday", "👍 Pretty Good"]}
                      value={satisfaction === "Would Eat Everyday" ? "🤩🤩🤩 Would Eat Everyday" : "👍 Pretty Good"}
                      onChange={(value) => setSatisfaction(value.replace(/^[^\w\s]*\s*/, '') as typeof satisfaction)}
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
                    disabled={saving || uploadStatus === 'uploading' || !restaurant || !dishName || !proteinSource || (!hasInStore && deliveryApps.length === 0) || !price}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {uploadStatus === 'uploading' 
                      ? `Uploading Photo (${uploadFileSize})...`
                      : saving 
                      ? 'Saving...' 
                      : 'Save Changes'}
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
