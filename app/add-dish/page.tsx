"use client"

import { useState, useEffect } from "react"
import { Upload, MapPin, AlertCircle } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/lib/auth/route-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { RestaurantSearchInput } from "@/components/ui/restaurant-search-input"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { RestaurantResult } from "@/lib/hooks/use-google-places"
import { createClient } from "@/lib/supabase/client"

export default function AddDishPage() {
  const [sourceType, setSourceType] = useState<"In-Restaurant" | "Online">("In-Restaurant")
  const [deliveryApps, setDeliveryApps] = useState<string[]>([])
  const [onlineRestaurant, setOnlineRestaurant] = useState("")
  const [restaurant, setRestaurant] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResult | null>(null)
  const [userCity, setUserCity] = useState("Mumbai")
  const [dishName, setDishName] = useState("")
  const [proteinSource, setProteinSource] = useState<
    "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Other" | ""
  >("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [taste, setTaste] = useState<"🤤 Amazing" | "👍 Great" | "">("")
  const [protein, setProtein] = useState<"💪 Overloaded" | "👍 Great" | "">("")
  const [price, setPrice] = useState<string>("")
  const [comment, setComment] = useState("")
  const [satisfaction, setSatisfaction] = useState<"🤩 Would Eat Everyday" | "👍 Great" | "">("")
  const [isLoading, setIsLoading] = useState(false)

  // Geolocation hooks
  const {
    userLocation,
    locationPermissionGranted,
    locationPermissionRequested,
    locationError,
    loading: locationLoading,
    requestLocationPermission,
    checkGeolocationSupport,
  } = useGeolocation()

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

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant: RestaurantResult) => {
    setSelectedRestaurant(restaurant)
    setRestaurant(restaurant.name)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proteinSource || !price) {
      alert("Protein source and price are required.");
      return;
    }
    if (sourceType === "Online" && !onlineRestaurant) {
      alert("Restaurant name is required for online dishes.");
      return;
    }
    if (sourceType === "Online" && deliveryApps.length === 0) {
      alert("At least one delivery app is required for online dishes.");
      return;
    }
    if (sourceType === "In-Restaurant" && !restaurant) {
      alert("Please search for and select a restaurant.");
      return;
    }
    setIsLoading(true);

    const supabase = createClient();
    let imageUrl = "";

    // 1. Handle Photo Upload to Supabase Storage
    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dish-photos") // NOTE: We will need to create this bucket in Supabase.
        .upload(fileName, photo);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        alert("Failed to upload photo. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Get the public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from("dish-photos")
        .getPublicUrl(uploadData.path);
      
      imageUrl = urlData.publicUrl;
    }

    // 2. Prepare Dish Data for API
    const dishData = {
      dish_name: dishName,
      restaurant_name: sourceType === "Online" ? onlineRestaurant : (selectedRestaurant?.name || restaurant),
      city: userCity,
      availability: sourceType === 'In-Restaurant' ? 'In-Store' : sourceType,
      image_url: imageUrl,
      price: parseFloat(price),
      protein_source: proteinSource,
      taste: taste.replace(/[^a-zA-Z\s]/g, '').trim(), // Cleans the string
      protein_content: protein.replace(/[^a-zA-Z\s]/g, '').trim(), // Cleans the string
      satisfaction: satisfaction.replace(/[^a-zA-Z\s]/g, '').trim(), // Cleans the string
      comment,
      delivery_apps: sourceType === "Online" ? deliveryApps : [],
      restaurant_address: selectedRestaurant?.formatted_address || null,
      latitude: selectedRestaurant?.geometry.location.lat || null,
      longitude: selectedRestaurant?.geometry.location.lng || null,
    };

    // 3. Submit Dish Data to our API
    try {
      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit dish.");
      }

      alert("Dish submitted successfully!");
      // Optionally, redirect or reset form here
      window.location.href = '/'; // Redirect to homepage on success

    } catch (error) {
      console.error("Submission Error:", error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="space-y-2">
                <Label>Source Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sourceType === "In-Restaurant" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("In-Restaurant")}
                    className="flex-1"
                  >
                    In-Restaurant
                  </Button>
                  <Button
                    type="button"
                    variant={sourceType === "Online" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("Online")}
                    className="flex-1"
                  >
                    Online
                  </Button>
                </div>
              </div>

              {/* Location Permission Request */}
              {sourceType === "In-Restaurant" && 
               (!locationPermissionRequested || !locationPermissionGranted) && 
               checkGeolocationSupport && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-0">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 text-sm">Find restaurants near you</h3>
                      <p className="text-blue-800 text-xs mt-1">
                        Allow location access to search restaurants closest to your current location. 
                        Otherwise, we'll search within your selected city ({userCity}).
                      </p>
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          onClick={requestLocationPermission}
                          disabled={locationLoading}
                          className="text-xs"
                        >
                          {locationLoading ? "Requesting..." : "Allow Location"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Error Display */}
              {locationError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-yellow-800 text-sm">{locationError}</span>
                  </div>
                </div>
              )}

              {sourceType === "In-Restaurant" ? (
                <RestaurantSearchInput
                  value={restaurant}
                  onChange={setRestaurant}
                  onSelect={handleRestaurantSelect}
                  userCity={userCity}
                  userLocation={userLocation}
                />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Delivery Apps *</Label>
                    <MultiSelect
                      options={[
                        { label: "Swiggy", value: "Swiggy" },
                        { label: "Zomato", value: "Zomato" },
                        { label: "Uber Eats", value: "Uber Eats" },
                        { label: "DoorDash", value: "DoorDash" },
                      ]}
                      selected={deliveryApps}
                      onChange={setDeliveryApps}
                      placeholder="Select delivery apps..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onlineRestaurant">Restaurant Name</Label>
                    <Input
                      id="onlineRestaurant"
                      type="text"
                      placeholder="Enter Restaurant Name"
                      value={onlineRestaurant}
                      onChange={(e) => setOnlineRestaurant(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

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
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="Enter exact price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !proteinSource || !price || (sourceType === "Online" && deliveryApps.length === 0)}>
                {isLoading ? "Submitting..." : "Submit Dish"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
